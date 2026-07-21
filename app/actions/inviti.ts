"use server";

import { randomBytes } from "node:crypto";
import { addDays } from "date-fns";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAgenzia, requirePrivato } from "@/lib/auth-helpers";
import { assicuraRelazioneAttiva } from "@/lib/immobili/relazioni";
import { completaInvitoSchema, redimiInvitoSchema, type CompletaInvitoInput, type RedimiInvitoInput } from "@/lib/validations/invito";

const DURATA_INVITO_GIORNI = 7;

export async function generaInvitoAction(
  contrattoId: string
): Promise<{ success: true; token: string; scadenza: Date } | { success: false; error: string }> {
  const { agenzia } = await requireAgenzia();

  const contratto = await prisma.contratto.findFirst({
    where: { id: contrattoId, agenziaId: agenzia.id },
    include: { inquilino: { include: { user: true } } },
  });
  if (!contratto) {
    return { success: false, error: "Contratto non trovato" };
  }

  const token = randomBytes(24).toString("base64url");
  const scadenza = addDays(new Date(), DURATA_INVITO_GIORNI);

  await prisma.invitoInquilino.create({
    data: {
      token,
      inquilinoId: contratto.inquilinoId,
      contrattoId: contratto.id,
      email: contratto.inquilino.user.email,
      scadenza,
    },
  });

  return { success: true, token, scadenza };
}

export async function completaInvitoAction(
  input: CompletaInvitoInput
): Promise<{ success: true; email: string } | { success: false; error: string }> {
  const parsed = completaInvitoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }

  const invito = await prisma.invitoInquilino.findUnique({
    where: { token: parsed.data.token },
    include: { inquilino: { include: { user: true } } },
  });
  if (!invito) {
    return { success: false, error: "Link di invito non valido" };
  }
  if (invito.usatoAt) {
    return { success: false, error: "Questo link è già stato utilizzato" };
  }
  if (invito.scadenza < new Date()) {
    return { success: false, error: "Questo link è scaduto. Contatta l'agenzia per riceverne uno nuovo." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: invito.inquilino.userId }, data: { passwordHash } }),
    prisma.invitoInquilino.update({ where: { id: invito.id }, data: { usatoAt: new Date() } }),
  ]);

  return { success: true, email: invito.inquilino.user.email };
}

/**
 * Un Privato già autenticato collega il contratto dietro un codice di invito al proprio
 * account, dal flusso "Aggiungi immobile" (percorso "come inquilino") — a differenza di
 * completaInvitoAction, qui l'account esiste già e ha già effettuato l'accesso: serve solo ad
 * assicurare la RelazioneImmobilePrivato, non a impostare una password.
 */
export async function redimiInvitoInquilinoAction(
  input: RedimiInvitoInput
): Promise<{ success: true; immobileId: string } | { success: false; error: string }> {
  const { privato } = await requirePrivato();

  const parsed = redimiInvitoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  const invito = await prisma.invitoInquilino.findUnique({
    where: { token: parsed.data.token },
    include: { contratto: true },
  });
  if (!invito) return { success: false, error: "Codice di invito non valido" };
  if (invito.scadenza < new Date()) {
    return { success: false, error: "Questo invito è scaduto. Contatta l'agenzia per riceverne uno nuovo." };
  }
  if (invito.inquilinoId !== privato.id) {
    return { success: false, error: "Questo invito è associato a un altro account. Contatta l'agenzia." };
  }

  await assicuraRelazioneAttiva({
    privatoId: privato.id,
    immobileId: invito.contratto.immobileId,
    ruolo: "INQUILINO",
    contrattoId: invito.contrattoId,
  });

  if (!invito.usatoAt) {
    await prisma.invitoInquilino.update({ where: { id: invito.id }, data: { usatoAt: new Date() } });
  }

  revalidatePath("/privato");

  return { success: true, immobileId: invito.contratto.immobileId };
}
