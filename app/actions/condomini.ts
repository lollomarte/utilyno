"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAmministratore } from "@/lib/auth-helpers";
import {
  nuovoCondominioSchema,
  segnalazioneCondominialeSchema,
  nuovaComunicazioneSchema,
  type NuovoCondominioInput,
  type SegnalazioneCondominialeInput,
  type NuovaComunicazioneInput,
} from "@/lib/validations/condominio";
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

  let notificaInquilino = false;
  let notificaProprietario = false;

  if (parsed.data.immobileId) {
    const immobile = await prisma.immobile.findFirst({
      where: { id: parsed.data.immobileId, condominioId: parsed.data.condominioId },
      include: { contratti: { where: { stato: "ATTIVO" } } },
    });
    if (!immobile) {
      return { success: false, error: "Immobile non valido per questo condominio" };
    }

    notificaInquilino = parsed.data.destinatario === "INQUILINO" || parsed.data.destinatario === "ENTRAMBI";
    notificaProprietario = parsed.data.destinatario === "PROPRIETARIO" || parsed.data.destinatario === "ENTRAMBI";

    if (notificaInquilino && immobile.contratti.length === 0) {
      return { success: false, error: "Questa unità non ha un inquilino attivo a cui inviare la segnalazione" };
    }
  }

  await prisma.segnalazioneCondominiale.create({
    data: {
      condominioId: parsed.data.condominioId,
      amministratoreId: amministratore.id,
      immobileId: parsed.data.immobileId || null,
      notificaInquilino,
      notificaProprietario,
      titolo: parsed.data.titolo,
      descrizione: parsed.data.descrizione,
      priorita: parsed.data.priorita,
    },
  });

  revalidatePath("/amministratore/segnalazioni");
  revalidatePath(`/amministratore/condomini/${parsed.data.condominioId}`);

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
