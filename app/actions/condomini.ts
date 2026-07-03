"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAmministratore } from "@/lib/auth-helpers";
import { nuovoCondominioSchema, segnalazioneCondominialeSchema, type NuovoCondominioInput, type SegnalazioneCondominialeInput } from "@/lib/validations/condominio";
import type { StatoSegnalazione } from "@prisma/client";

export async function creaCondominioAction(
  input: NuovoCondominioInput
): Promise<{ success: true; condominioId: string } | { success: false; error: string }> {
  const { amministratore } = await requireAmministratore();

  const parsed = nuovoCondominioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }

  const condominio = await prisma.condominio.create({
    data: {
      amministratoreId: amministratore.id,
      nome: parsed.data.nome,
      indirizzo: parsed.data.indirizzo,
      comune: parsed.data.comune,
      numeroUnita: parsed.data.numeroUnita,
    },
  });

  revalidatePath("/amministratore/condomini");

  return { success: true, condominioId: condominio.id };
}

export async function creaSegnalazioneAction(
  input: SegnalazioneCondominialeInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { amministratore } = await requireAmministratore();

  const parsed = segnalazioneCondominialeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }

  const condominio = await prisma.condominio.findFirst({
    where: { id: parsed.data.condominioId, amministratoreId: amministratore.id },
  });
  if (!condominio) {
    return { success: false, error: "Condominio non valido" };
  }

  await prisma.segnalazioneCondominiale.create({
    data: {
      condominioId: parsed.data.condominioId,
      amministratoreId: amministratore.id,
      titolo: parsed.data.titolo,
      descrizione: parsed.data.descrizione,
      priorita: parsed.data.priorita,
    },
  });

  revalidatePath("/amministratore/segnalazioni");

  return { success: true };
}

export async function aggiornaStatoSegnalazioneAction(
  segnalazioneId: string,
  stato: StatoSegnalazione
): Promise<{ success: true } | { success: false; error: string }> {
  const { amministratore } = await requireAmministratore();

  const segnalazione = await prisma.segnalazioneCondominiale.findFirst({
    where: { id: segnalazioneId, amministratoreId: amministratore.id },
  });
  if (!segnalazione) {
    return { success: false, error: "Segnalazione non trovata" };
  }

  await prisma.segnalazioneCondominiale.update({
    where: { id: segnalazioneId },
    data: { stato },
  });

  revalidatePath("/amministratore/segnalazioni");

  return { success: true };
}
