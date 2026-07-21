"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { attivaUtenzaSchema, type AttivaUtenzaInput } from "@/lib/validations/utenza";

async function verificaAccessoImmobile(userId: string, immobile: { id: string; agenziaId: string | null }): Promise<boolean> {
  const [agenzia, relazione] = await Promise.all([
    immobile.agenziaId ? prisma.agenzia.findUnique({ where: { userId } }) : null,
    prisma.relazioneImmobilePrivato.findFirst({
      where: { immobileId: immobile.id, stato: "ATTIVA", privato: { userId } },
    }),
  ]);
  if (agenzia && agenzia.id === immobile.agenziaId) return true;
  if (relazione) return true;
  return false;
}

export async function attivaUtenzaAction(
  input: AttivaUtenzaInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorizzato" };

  const parsed = attivaUtenzaSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const { immobileId, tipo, fornitore, codicePod, codicePdr, fornitoreUscente, indirizzoFornitura } = parsed.data;

  const immobile = await prisma.immobile.findUnique({ where: { id: immobileId } });
  if (!immobile) return { success: false, error: "Immobile non trovato" };

  const autorizzato = await verificaAccessoImmobile(session.user.id, immobile);
  if (!autorizzato) return { success: false, error: "Non autorizzato" };

  const datiAggiuntivi = {
    codicePod: codicePod ?? null,
    codicePdr: codicePdr ?? null,
    fornitoreUscente: fornitoreUscente ?? null,
    indirizzoFornitura: indirizzoFornitura ?? null,
  };

  const esistente = await prisma.utenza.findFirst({ where: { immobileId, tipo } });
  if (esistente) {
    await prisma.utenza.update({
      where: { id: esistente.id },
      data: { fornitore, stato: "ATTIVA", dataAttivazione: new Date(), ...datiAggiuntivi },
    });
  } else {
    await prisma.utenza.create({
      data: { immobileId, tipo, fornitore, stato: "ATTIVA", dataAttivazione: new Date(), ...datiAggiuntivi },
    });
  }

  revalidatePath(`/privato/${immobileId}`);
  revalidatePath(`/agenzia/immobili/${immobileId}`);

  return { success: true };
}
