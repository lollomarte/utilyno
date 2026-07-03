"use server";

import { randomBytes } from "node:crypto";
import { addDays } from "date-fns";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAgenzia } from "@/lib/auth-helpers";
import { completaInvitoSchema, type CompletaInvitoInput } from "@/lib/validations/invito";

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
