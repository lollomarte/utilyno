import { prisma } from "@/lib/prisma";
import type { RuoloRelazioneImmobile } from "@prisma/client";

/** Trova la relazione PROPRIETARIO attiva più recente di un immobile: deve essercene sempre una
 * (tranne rarissimi casi di dati incoerenti). Usato ovunque prima si risaliva da un immobile al
 * proprietario tramite Immobile.proprietarioId, che non esiste più — la titolarità ora vive solo
 * su RelazioneImmobilePrivato. */
export async function getRelazioneProprietarioAttiva(immobileId: string) {
  return prisma.relazioneImmobilePrivato.findFirst({
    where: { immobileId, ruolo: "PROPRIETARIO", stato: "ATTIVA" },
    include: { privato: { include: { user: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Crea la relazione se non esiste già una ATTIVA con lo stesso privato/immobile/ruolo, altrimenti
 * la riusa (aggiornando contrattoId se fornito e diverso). Usato alla creazione di un Immobile
 * (relazione PROPRIETARIO) e alla creazione/attivazione di un Contratto (relazione INQUILINO, e
 * verifica di quella PROPRIETARIO esistente) — evita di creare relazioni duplicate quando la
 * stessa coppia privato/immobile/ruolo viene toccata da più flussi.
 */
export async function assicuraRelazioneAttiva(params: {
  privatoId: string;
  immobileId: string;
  ruolo: RuoloRelazioneImmobile;
  contrattoId?: string | null;
}) {
  const esistente = await prisma.relazioneImmobilePrivato.findFirst({
    where: { privatoId: params.privatoId, immobileId: params.immobileId, ruolo: params.ruolo, stato: "ATTIVA" },
  });
  if (esistente) {
    if (params.contrattoId && esistente.contrattoId !== params.contrattoId) {
      return prisma.relazioneImmobilePrivato.update({
        where: { id: esistente.id },
        data: { contrattoId: params.contrattoId },
      });
    }
    return esistente;
  }
  return prisma.relazioneImmobilePrivato.create({
    data: {
      privatoId: params.privatoId,
      immobileId: params.immobileId,
      ruolo: params.ruolo,
      stato: "ATTIVA",
      contrattoId: params.contrattoId ?? null,
    },
  });
}
