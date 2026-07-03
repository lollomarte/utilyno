"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function utenteHaAccessoAComunicazione(userId: string, role: string, condominioId: string): Promise<boolean> {
  if (role === "INQUILINO") {
    const inquilino = await prisma.inquilino.findUnique({ where: { userId } });
    if (!inquilino) return false;
    const contratto = await prisma.contratto.findFirst({
      where: { inquilinoId: inquilino.id, stato: "ATTIVO", immobile: { condominioId } },
    });
    return !!contratto;
  }

  if (role === "PROPRIETARIO") {
    const proprietario = await prisma.proprietario.findUnique({ where: { userId } });
    if (!proprietario) return false;
    const immobile = await prisma.immobile.findFirst({
      where: { proprietarioId: proprietario.id, condominioId },
    });
    return !!immobile;
  }

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

  const autorizzato = await utenteHaAccessoAComunicazione(session.user.id, session.user.role, comunicazione.condominioId);
  if (!autorizzato) {
    return { success: false, error: "Non autorizzato" };
  }

  await prisma.letturaComunicazione.upsert({
    where: { comunicazioneId_userId: { comunicazioneId, userId: session.user.id } },
    create: { comunicazioneId, userId: session.user.id },
    update: {},
  });

  revalidatePath("/inquilino");
  revalidatePath("/proprietario");

  return { success: true };
}
