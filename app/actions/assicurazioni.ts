"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProprietario } from "@/lib/auth-helpers";
import { insuranceProvider } from "@/lib/services/insurance-provider";
import { attivaAssicurazioneSchema, type AttivaAssicurazioneInput } from "@/lib/validations/assicurazione";

export async function attivaAssicurazioneAction(
  input: AttivaAssicurazioneInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { proprietario } = await requireProprietario();

  const parsed = attivaAssicurazioneSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }
  const data = parsed.data;

  const immobile = await prisma.immobile.findFirst({ where: { id: data.immobileId, proprietarioId: proprietario.id } });
  if (!immobile) {
    return { success: false, error: "Immobile non valido" };
  }

  const result = await insuranceProvider.activatePolicy({
    immobileId: data.immobileId,
    tipo: data.tipo,
    premioAnnuale: data.premioAnnuale,
  });

  await prisma.assicurazione.create({
    data: {
      immobileId: data.immobileId,
      tipo: data.tipo,
      fornitore: result.fornitore,
      premioAnnuale: data.premioAnnuale,
      stato: "ATTIVA",
      dataScadenza: result.dataScadenza,
      commissioneLoqo: result.commissioneLoqo,
    },
  });

  revalidatePath("/proprietario");
  revalidatePath(`/proprietario/immobili/${data.immobileId}`);

  return { success: true };
}
