"use server";

import { revalidatePath } from "next/cache";
import { addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAgenzia } from "@/lib/auth-helpers";
import { adeRegistrationProvider } from "@/lib/services/ade-registration";
import { nuovoContrattoSchema, type NuovoContrattoInput } from "@/lib/validations/contratto";

export async function registraContrattoAdEAction(
  contrattoId: string
): Promise<{ success: true; protocollo: string } | { success: false; error: string }> {
  const { agenzia } = await requireAgenzia();

  const contratto = await prisma.contratto.findFirst({ where: { id: contrattoId, agenziaId: agenzia.id } });
  if (!contratto) {
    return { success: false, error: "Contratto non trovato" };
  }

  const result = await adeRegistrationProvider.registerContract({
    contrattoId: contratto.id,
    canoneMensile: contratto.canoneMensile,
    dataInizio: contratto.dataInizio,
    dataFine: contratto.dataFine,
  });

  await prisma.contratto.update({
    where: { id: contratto.id },
    data: { dataRegistrazioneAdE: result.dataRegistrazione },
  });

  revalidatePath(`/agenzia/contratti/${contrattoId}`);

  return { success: true, protocollo: result.protocollo };
}

export async function creaContrattoAction(
  input: NuovoContrattoInput
): Promise<{ success: true; contrattoId: string } | { success: false; error: string }> {
  const { agenzia } = await requireAgenzia();

  const parsed = nuovoContrattoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }
  const data = parsed.data;

  const immobile = await prisma.immobile.findFirst({ where: { id: data.immobileId, agenziaId: agenzia.id } });
  if (!immobile) {
    return { success: false, error: "Immobile non valido" };
  }

  const inquilino = await prisma.inquilino.findUnique({ where: { id: data.inquilinoId } });
  if (!inquilino) {
    return { success: false, error: "Inquilino non valido" };
  }

  const dataInizio = new Date(data.dataInizio);
  const dataFine = new Date(data.dataFine);

  const contratto = await prisma.contratto.create({
    data: {
      immobileId: data.immobileId,
      inquilinoId: data.inquilinoId,
      agenziaId: agenzia.id,
      tipoContratto: data.tipoContratto,
      dataInizio,
      dataFine,
      canoneMensile: data.canoneMensile,
      regimeFiscale: data.regimeFiscale,
      stato: "ATTIVO",
    },
  });

  const numeroRate = Math.min(24, Math.max(1, Math.round((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24 * 30))));
  await prisma.pagamento.createMany({
    data: Array.from({ length: numeroRate }, (_, i) => ({
      contrattoId: contratto.id,
      importo: data.canoneMensile,
      dataScadenza: addMonths(dataInizio, i),
      stato: "PROGRAMMATO" as const,
    })),
  });

  revalidatePath("/agenzia/contratti");

  return { success: true, contrattoId: contratto.id };
}
