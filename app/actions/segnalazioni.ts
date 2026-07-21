"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { risolviDestinatari, getCategorieDisponibili } from "@/lib/segnalazioni/risolviDestinatari";
import {
  nuovaSegnalazioneSchema,
  rispostaSegnalazioneSchema,
  richiediPreventivoSchema,
  aggiornaStatoSegnalazioneSchema,
  type NuovaSegnalazioneInput,
  type RispostaSegnalazioneInput,
  type RichiediPreventivoInput,
} from "@/lib/validations/segnalazione";
import { ROLE_LABELS } from "@/lib/labels";
import type { StatoSegnalazione } from "@prisma/client";

const LIST_PATHS = ["/amministratore/segnalazioni", "/inquilino/segnalazioni", "/proprietario/segnalazioni", "/agenzia/segnalazioni"];

function revalidateListe() {
  for (const path of LIST_PATHS) revalidatePath(path);
}

/** Verifica che l'utente corrente abbia una relazione legittima con l'immobile, in una
 * qualunque delle vesti che può avere (un utente può essere Proprietario di un immobile e
 * Inquilino di un altro contemporaneamente: si controllano tutte le relazioni possibili,
 * non un singolo ruolo dichiarato). */
async function verificaAccessoImmobile(userId: string, immobileId: string): Promise<boolean> {
  const immobile = await prisma.immobile.findUnique({
    where: { id: immobileId },
    include: {
      proprietario: true,
      agenzia: true,
      condominio: true,
      contratti: { where: { stato: "ATTIVO" }, include: { inquilino: true }, take: 1 },
    },
  });
  if (!immobile) return false;

  if (immobile.proprietario.userId === userId) return true;
  if (immobile.agenzia?.userId === userId) return true;
  if (immobile.contratti[0]?.inquilino.userId === userId) return true;
  if (immobile.condominio) {
    const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
    if (amministratore?.id === immobile.condominio.amministratoreId) return true;
  }
  return false;
}

export async function creaSegnalazioneAction(
  input: NuovaSegnalazioneInput
): Promise<
  | { success: true; destinatari: { nome: string; cognome: string; ruolo: string }[] }
  | { success: false; error: string }
> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sessione non valida" };

  const parsed = nuovaSegnalazioneSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  const haAccesso = await verificaAccessoImmobile(session.user.id, parsed.data.immobileId);
  if (!haAccesso) return { success: false, error: "Non hai accesso a questo immobile" };

  if (parsed.data.categoria) {
    const categorieValide = await getCategorieDisponibili(parsed.data.immobileId);
    if (!categorieValide.includes(parsed.data.categoria)) {
      return { success: false, error: "Categoria non valida per questo immobile" };
    }
  }

  const destinatari = await risolviDestinatari({
    immobileId: parsed.data.immobileId,
    categoria: parsed.data.categoria ?? null,
    mittenteUserId: session.user.id,
  });

  await prisma.segnalazione.create({
    data: {
      titolo: parsed.data.titolo,
      descrizione: parsed.data.descrizione,
      categoria: parsed.data.categoria,
      categoriaIntervento: parsed.data.categoriaIntervento,
      priorita: parsed.data.priorita,
      fotoUrls: parsed.data.fotoUrls ?? [],
      fasciaOrariaDisponibile: parsed.data.fasciaOrariaDisponibile ?? null,
      creatoDaUserId: session.user.id,
      immobileId: parsed.data.immobileId,
      destinatari: {
        create: [
          { userId: session.user.id, letto: true, dataLettura: new Date() },
          ...destinatari.map((d) => ({ userId: d.userId, letto: false })),
        ],
      },
    },
  });

  revalidateListe();

  return {
    success: true,
    destinatari: destinatari.map((d) => ({ nome: d.nome, cognome: d.cognome, ruolo: ROLE_LABELS[d.ruolo] ?? d.ruolo })),
  };
}

export async function aggiornaStatoSegnalazioneAction(
  segnalazioneId: string,
  stato: StatoSegnalazione
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sessione non valida" };

  const parsed = aggiornaStatoSegnalazioneSchema.safeParse({ segnalazioneId, stato });
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  const segnalazione = await prisma.segnalazione.findUnique({
    where: { id: parsed.data.segnalazioneId },
    include: { immobile: { include: { condominio: true } } },
  });
  if (!segnalazione) return { success: false, error: "Segnalazione non trovata" };

  let autorizzato = segnalazione.creatoDaUserId === session.user.id;
  if (!autorizzato && session.user.profili.includes("AMMINISTRATORE") && segnalazione.immobile.condominio) {
    const amministratore = await prisma.amministratore.findUnique({ where: { userId: session.user.id } });
    autorizzato = amministratore?.id === segnalazione.immobile.condominio.amministratoreId;
  }
  if (!autorizzato) return { success: false, error: "Non hai i permessi per modificare questa segnalazione" };

  await prisma.segnalazione.update({ where: { id: parsed.data.segnalazioneId }, data: { stato: parsed.data.stato } });

  revalidateListe();

  return { success: true };
}

export async function aggiungiRispostaAction(
  input: RispostaSegnalazioneInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sessione non valida" };

  const parsed = rispostaSegnalazioneSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  const segnalazione = await prisma.segnalazione.findUnique({
    where: { id: parsed.data.segnalazioneId },
    include: { destinatari: true },
  });
  if (!segnalazione) return { success: false, error: "Segnalazione non trovata" };

  const isPartecipante =
    segnalazione.creatoDaUserId === session.user.id || segnalazione.destinatari.some((d) => d.userId === session.user.id);
  if (!isPartecipante) return { success: false, error: "Non hai accesso a questa segnalazione" };

  await prisma.segnalazioneRisposta.create({
    data: { segnalazioneId: segnalazione.id, autoreUserId: session.user.id, testo: parsed.data.testo },
  });

  await prisma.segnalazioneDestinatario.updateMany({
    where: { segnalazioneId: segnalazione.id, userId: { not: session.user.id } },
    data: { letto: false, dataLettura: null },
  });
  await prisma.segnalazioneDestinatario.updateMany({
    where: { segnalazioneId: segnalazione.id, userId: session.user.id },
    data: { letto: true, dataLettura: new Date() },
  });

  return { success: true };
}

export async function segnaSegnalazioneLettaAction(segnalazioneId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await prisma.segnalazioneDestinatario.updateMany({
    where: { segnalazioneId, userId: session.user.id, letto: false },
    data: { letto: true, dataLettura: new Date() },
  });
}

export async function richiediPreventivoAction(
  input: RichiediPreventivoInput
): Promise<{ success: true; partnerNome: string } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sessione non valida" };

  const parsed = richiediPreventivoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  const segnalazione = await prisma.segnalazione.findUnique({
    where: { id: parsed.data.segnalazioneId },
    include: { destinatari: true, richiestaPreventivo: true },
  });
  if (!segnalazione) return { success: false, error: "Segnalazione non trovata" };

  const isPartecipante =
    segnalazione.creatoDaUserId === session.user.id || segnalazione.destinatari.some((d) => d.userId === session.user.id);
  if (!isPartecipante) return { success: false, error: "Non hai accesso a questa segnalazione" };

  if (segnalazione.richiestaPreventivo) {
    return { success: false, error: "È già stato richiesto un preventivo per questa segnalazione" };
  }

  const partner = await prisma.partner.findFirst({ where: { id: parsed.data.partnerId, attivo: true } });
  if (!partner) return { success: false, error: "Partner non disponibile" };

  try {
    await prisma.richiestaPreventivo.create({
      data: {
        segnalazioneId: segnalazione.id,
        partnerId: partner.id,
        richiedenteUserId: session.user.id,
      },
    });
  } catch {
    return { success: false, error: "È già stato richiesto un preventivo per questa segnalazione" };
  }

  revalidateListe();

  return { success: true, partnerNome: partner.nome };
}
