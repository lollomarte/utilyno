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

async function verificaAccessoImmobile(userId: string, immobile: { id: string; agenziaId: string | null }): Promise<boolean> {
  const [agenzia, relazione] = await Promise.all([
    immobile.agenziaId ? prisma.agenzia.findUnique({ where: { userId } }) : null,
    prisma.relazioneImmobilePrivato.findFirst({
      where: { immobileId: immobile.id, ruolo: "PROPRIETARIO", stato: "ATTIVA", privato: { userId } },
    }),
  ]);
  if (agenzia && agenzia.id === immobile.agenziaId) return true;
  if (relazione) return true;
  return false;
}

export async function attivaAssicurazioneAction(
  input: AttivaAssicurazioneInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorizzato" };

  const parsed = attivaAssicurazioneSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const { immobileId, tipo, fornitore, premioAnnuale, valoreAssicurato } = parsed.data;

  const immobile = await prisma.immobile.findUnique({ where: { id: immobileId } });
  if (!immobile) return { success: false, error: "Immobile non trovato" };

  const autorizzato = await verificaAccessoImmobile(session.user.id, immobile);
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
      valoreAssicurato: valoreAssicurato ?? null,
    },
  });

  revalidatePath(`/privato/${immobileId}`);
  revalidatePath(`/agenzia/immobili/${immobileId}`);

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

  const autorizzato = await verificaAccessoImmobile(session.user.id, assicurazione.immobile);
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

  revalidatePath(`/privato/${assicurazione.immobileId}`);
  revalidatePath(`/agenzia/immobili/${assicurazione.immobileId}`);

  return { success: true };
}
