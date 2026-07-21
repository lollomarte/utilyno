"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function utenteHaAccessoAComunicazione(userId: string, condominioId: string): Promise<boolean> {
  const privato = await prisma.privato.findUnique({ where: { userId } });
  if (!privato) return false;

  const contratto = await prisma.contratto.findFirst({
    where: { inquilinoId: privato.id, stato: "ATTIVO", immobile: { condominioId } },
  });
  if (contratto) return true;

  const relazione = await prisma.relazioneImmobilePrivato.findFirst({
    where: { privatoId: privato.id, ruolo: "PROPRIETARIO", stato: "ATTIVA", immobile: { condominioId } },
  });
  if (relazione) return true;

  return false;
}

export async function segnaComunicazioneLettaAction(
  comunicazioneId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non autenticato" };
  }

  const comunicazione = await prisma.comunicazioneCondominiale.findUnique({ where: { id: comunicazioneId } });
  if (!comunicazione) {
    return { success: false, error: "Comunicazione non trovata" };
  }

  const autorizzato = await utenteHaAccessoAComunicazione(session.user.id, comunicazione.condominioId);
  if (!autorizzato) {
    return { success: false, error: "Non autorizzato" };
  }

  await prisma.letturaComunicazione.upsert({
    where: { comunicazioneId_userId: { comunicazioneId, userId: session.user.id } },
    create: { comunicazioneId, userId: session.user.id },
    update: {},
  });

  revalidatePath("/privato");

  return { success: true };
}
