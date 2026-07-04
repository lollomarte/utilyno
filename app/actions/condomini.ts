"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAmministratore } from "@/lib/auth-helpers";
import {
  nuovoCondominioSchema,
  nuovaComunicazioneSchema,
  type NuovoCondominioInput,
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
