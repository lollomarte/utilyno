"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAmministratore } from "@/lib/auth-helpers";
import {
  nuovoCondominioSchema,
  aggiornaCondominioSchema,
  nuovaComunicazioneSchema,
  type NuovoCondominioInput,
  type AggiornaCondominioInput,
  type NuovaComunicazioneInput,
} from "@/lib/validations/condominio";

export async function creaCondominioAction(
  input: NuovoCondominioInput
): Promise<{ success: true; condominioId: string } | { success: false; error: string }> {
  const { amministratore } = await requireAmministratore();

  const parsed = nuovoCondominioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }
  const data = parsed.data;

  const condominio = await prisma.condominio.create({
    data: {
      amministratoreId: amministratore.id,
      nome: data.nome,
      indirizzo: data.indirizzo,
      comune: data.comune,
      numeroUnita: data.numeroUnita,
      codiceFiscale: data.codiceFiscale ?? null,
      ibanCondominio: data.ibanCondominio ?? null,
      annoCostruzione: data.annoCostruzione ?? null,
      ascensore: data.ascensore ?? null,
      impiantiComuni: data.impiantiComuni ?? [],
    },
  });

  revalidatePath("/amministratore/condomini");

  return { success: true, condominioId: condominio.id };
}

/** Modifica i dati di un Condominio già esistente: prima d'ora non esisteva nessun form di modifica. */
export async function aggiornaCondominioAction(
  input: AggiornaCondominioInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { amministratore } = await requireAmministratore();

  const parsed = aggiornaCondominioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }
  const data = parsed.data;

  const condominio = await prisma.condominio.findFirst({
    where: { id: data.condominioId, amministratoreId: amministratore.id },
  });
  if (!condominio) return { success: false, error: "Condominio non valido" };

  await prisma.condominio.update({
    where: { id: condominio.id },
    data: {
      nome: data.nome,
      indirizzo: data.indirizzo,
      comune: data.comune,
      numeroUnita: data.numeroUnita,
      codiceFiscale: data.codiceFiscale ?? null,
      ibanCondominio: data.ibanCondominio ?? null,
      annoCostruzione: data.annoCostruzione ?? null,
      ascensore: data.ascensore ?? null,
      impiantiComuni: data.impiantiComuni ?? [],
    },
  });

  revalidatePath("/amministratore/condomini");
  revalidatePath(`/amministratore/condomini/${condominio.id}`);

  return { success: true };
}

export async function creaComunicazioneAction(
  input: NuovaComunicazioneInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { amministratore } = await requireAmministratore();

  const parsed = nuovaComunicazioneSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }

  const condominio = await prisma.condominio.findFirst({
    where: { id: parsed.data.condominioId, amministratoreId: amministratore.id },
  });
  if (!condominio) {
    return { success: false, error: "Condominio non valido" };
  }

  await prisma.comunicazioneCondominiale.create({
    data: {
      condominioId: parsed.data.condominioId,
      amministratoreId: amministratore.id,
      titolo: parsed.data.titolo,
      testo: parsed.data.testo,
    },
  });

  revalidatePath(`/amministratore/condomini/${parsed.data.condominioId}`);

  return { success: true };
}
