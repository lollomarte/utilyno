"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { attivaUtenzaSchema, type AttivaUtenzaInput } from "@/lib/validations/utenza";

async function verificaAccessoImmobile(
  userId: string,
  role: string,
  immobile: { id: string; agenziaId: string | null; proprietarioId: string }
): Promise<boolean> {
  if (role === "AGENZIA") {
    const agenzia = await prisma.agenzia.findUnique({ where: { userId } });
    return agenzia?.id === immobile.agenziaId;
  }
  if (role === "PROPRIETARIO") {
    const proprietario = await prisma.proprietario.findUnique({ where: { userId } });
    return proprietario?.id === immobile.proprietarioId;
  }
  if (role === "INQUILINO") {
    const inquilino = await prisma.inquilino.findUnique({ where: { userId } });
    if (!inquilino) return false;
    const contratto = await prisma.contratto.findFirst({
      where: { immobileId: immobile.id, inquilinoId: inquilino.id, stato: "ATTIVO" },
    });
    return !!contratto;
  }
  return false;
}

export async function attivaUtenzaAction(
  input: AttivaUtenzaInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorizzato" };

  const parsed = attivaUtenzaSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const { immobileId, tipo, fornitore } = parsed.data;

  const immobile = await prisma.immobile.findUnique({ where: { id: immobileId } });
  if (!immobile) return { success: false, error: "Immobile non trovato" };

  const autorizzato = await verificaAccessoImmobile(session.user.id, session.user.role, immobile);
  if (!autorizzato) return { success: false, error: "Non autorizzato" };

  const esistente = await prisma.utenza.findFirst({ where: { immobileId, tipo } });
  if (esistente) {
    await prisma.utenza.update({
      where: { id: esistente.id },
      data: { fornitore, stato: "ATTIVA", dataAttivazione: new Date() },
    });
  } else {
    await prisma.utenza.create({
      data: { immobileId, tipo, fornitore, stato: "ATTIVA", dataAttivazione: new Date() },
    });
  }

  revalidatePath(`/proprietario/immobili/${immobileId}`);
  revalidatePath(`/agenzia/immobili/${immobileId}`);
  revalidatePath("/inquilino");

  return { success: true };
}
