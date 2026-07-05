"use server";

import { addYears } from "date-fns";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  attivaAssicurazioneSchema,
  rinnovaAssicurazioneSchema,
  type AttivaAssicurazioneInput,
  type RinnovaAssicurazioneInput,
} from "@/lib/validations/assicurazione";

/** Percentuale di commissione LOQO sul premio annuale: dato interno, mai mostrato al proprietario. */
const COMMISSIONE_PERCENTUALE = 0.1;

function calcolaCommissioneLoqo(premioAnnuale: number): number {
  return Math.round(premioAnnuale * COMMISSIONE_PERCENTUALE * 100) / 100;
}

async function verificaAccessoImmobile(
  userId: string,
  role: string,
  immobile: { agenziaId: string; proprietarioId: string }
): Promise<boolean> {
  if (role === "AGENZIA") {
    const agenzia = await prisma.agenzia.findUnique({ where: { userId } });
    return agenzia?.id === immobile.agenziaId;
  }
  if (role === "PROPRIETARIO") {
    const proprietario = await prisma.proprietario.findUnique({ where: { userId } });
    return proprietario?.id === immobile.proprietarioId;
  }
  return false;
}

export async function attivaAssicurazioneAction(
  input: AttivaAssicurazioneInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorizzato" };

  const parsed = attivaAssicurazioneSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const { immobileId, tipo, fornitore, premioAnnuale } = parsed.data;

  const immobile = await prisma.immobile.findUnique({ where: { id: immobileId } });
  if (!immobile) return { success: false, error: "Immobile non trovato" };

  const autorizzato = await verificaAccessoImmobile(session.user.id, session.user.role, immobile);
  if (!autorizzato) return { success: false, error: "Non autorizzato" };

  const oggi = new Date();
  await prisma.assicurazione.create({
    data: {
      immobileId,
      tipo,
      fornitore,
      premioAnnuale,
      stato: "ATTIVA",
      dataScadenza: addYears(oggi, 1),
      commissioneLoqo: calcolaCommissioneLoqo(premioAnnuale),
    },
  });

  revalidatePath(`/proprietario/immobili/${immobileId}`);
  revalidatePath(`/agenzia/immobili/${immobileId}`);
  revalidatePath("/proprietario");

  return { success: true };
}

export async function rinnovaAssicurazioneAction(
  input: RinnovaAssicurazioneInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorizzato" };

  const parsed = rinnovaAssicurazioneSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const { assicurazioneId, premioAnnuale } = parsed.data;

  const assicurazione = await prisma.assicurazione.findUnique({
    where: { id: assicurazioneId },
    include: { immobile: true },
  });
  if (!assicurazione) return { success: false, error: "Assicurazione non trovata" };

  const autorizzato = await verificaAccessoImmobile(session.user.id, session.user.role, assicurazione.immobile);
  if (!autorizzato) return { success: false, error: "Non autorizzato" };

  const oggi = new Date();
  const basePartenza = assicurazione.dataScadenza > oggi ? assicurazione.dataScadenza : oggi;

  await prisma.assicurazione.update({
    where: { id: assicurazioneId },
    data: {
      premioAnnuale,
      stato: "ATTIVA",
      dataScadenza: addYears(basePartenza, 1),
      commissioneLoqo: calcolaCommissioneLoqo(premioAnnuale),
    },
  });

  revalidatePath(`/proprietario/immobili/${assicurazione.immobileId}`);
  revalidatePath(`/agenzia/immobili/${assicurazione.immobileId}`);
  revalidatePath("/proprietario");

  return { success: true };
}
