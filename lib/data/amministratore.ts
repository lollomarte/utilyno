import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

/** Una segnalazione APERTA di priorità ALTA aperta da più di questi giorni è considerata urgente. */
const SOGLIA_GIORNI_URGENZA = 3;

export async function getAmministratoreDashboardStats(amministratoreId: string, userId: string) {
  const [numeroCondomini, condomini, segnalazioniAperte] = await Promise.all([
    prisma.condominio.count({ where: { amministratoreId } }),
    prisma.condominio.findMany({ where: { amministratoreId }, select: { numeroUnita: true } }),
    prisma.segnalazioneDestinatario.count({
      where: { userId, segnalazione: { stato: { in: ["APERTA", "IN_LAVORAZIONE"] } } },
    }),
  ]);

  const unitaTotali = condomini.reduce((sum, c) => sum + c.numeroUnita, 0);

  return { numeroCondomini, unitaTotali, segnalazioniAperte };
}

export async function getCondominiForAmministratore(amministratoreId: string) {
  const condomini = await prisma.condominio.findMany({
    where: { amministratoreId },
    include: { _count: { select: { immobili: true } } },
    orderBy: { nome: "asc" },
  });

  const segnalazioni = await prisma.segnalazione.findMany({
    where: { immobile: { condominioId: { in: condomini.map((c) => c.id) } } },
    select: { immobile: { select: { condominioId: true } } },
  });
  const conteggioPerCondominio = new Map<string, number>();
  for (const s of segnalazioni) {
    const cid = s.immobile.condominioId;
    if (!cid) continue;
    conteggioPerCondominio.set(cid, (conteggioPerCondominio.get(cid) ?? 0) + 1);
  }

  return condomini.map((c) => ({
    ...c,
    _count: { ...c._count, segnalazioni: conteggioPerCondominio.get(c.id) ?? 0 },
  }));
}

/**
 * Statistiche per condominio per la dashboard: occupazione (immobili con contratto
 * attivo sul totale collegato a LOQO), segnalazioni per stato con indicatore di
 * urgenza, e lead/preventivi generati dalle segnalazioni di quel condominio.
 */
export async function getCondominiConStatistiche(amministratoreId: string) {
  const condomini = await prisma.condominio.findMany({
    where: { amministratoreId },
    include: {
      immobili: {
        select: { id: true, contratti: { where: { stato: "ATTIVO" }, select: { id: true } } },
      },
    },
    orderBy: { nome: "asc" },
  });
  const condominioIds = condomini.map((c) => c.id);

  const [segnalazioni, richiestePreventivo] = await Promise.all([
    prisma.segnalazione.findMany({
      where: { immobile: { condominioId: { in: condominioIds } } },
      select: { stato: true, priorita: true, createdAt: true, immobile: { select: { condominioId: true } } },
    }),
    prisma.richiestaPreventivo.findMany({
      where: { segnalazione: { immobile: { condominioId: { in: condominioIds } } } },
      select: { segnalazione: { select: { immobile: { select: { condominioId: true } } } } },
    }),
  ]);

  const sogliaUrgenza = subDays(new Date(), SOGLIA_GIORNI_URGENZA);

  return condomini.map((c) => {
    const immobiliCollegati = c.immobili.length;
    const immobiliOccupati = c.immobili.filter((i) => i.contratti.length > 0).length;
    const percentualeOccupazione = immobiliCollegati > 0 ? (immobiliOccupati / immobiliCollegati) * 100 : null;

    const segnalazioniCondominio = segnalazioni.filter((s) => s.immobile.condominioId === c.id);
    const segnalazioniAperte = segnalazioniCondominio.filter((s) => s.stato === "APERTA").length;
    const segnalazioniInLavorazione = segnalazioniCondominio.filter((s) => s.stato === "IN_LAVORAZIONE").length;
    const haUrgenze = segnalazioniCondominio.some(
      (s) => s.stato === "APERTA" && s.priorita === "ALTA" && s.createdAt < sogliaUrgenza
    );

    const leadGenerati = richiestePreventivo.filter((r) => r.segnalazione.immobile.condominioId === c.id).length;

    return {
      id: c.id,
      nome: c.nome,
      comune: c.comune,
      numeroUnita: c.numeroUnita,
      immobiliCollegati,
      immobiliOccupati,
      percentualeOccupazione,
      segnalazioniAperte,
      segnalazioniInLavorazione,
      haUrgenze,
      leadGenerati,
    };
  });
}

export async function getCondominioDetail(condominioId: string, amministratoreId: string) {
  return prisma.condominio.findFirst({
    where: { id: condominioId, amministratoreId },
    include: {
      immobili: {
        include: {
          relazioni: {
            where: { ruolo: "PROPRIETARIO", stato: "ATTIVA" },
            include: { privato: { include: { user: true } } },
            orderBy: { updatedAt: "desc" },
            take: 1,
          },
          contratti: { where: { stato: "ATTIVO" }, include: { inquilino: { include: { user: true } } } },
        },
      },
    },
  });
}

/** Le richieste di preventivo generate dalle segnalazioni di questo condominio, con partner e stato. */
export async function getRichiestePreventivoPerCondominio(condominioId: string) {
  return prisma.richiestaPreventivo.findMany({
    where: { segnalazione: { immobile: { condominioId } } },
    include: { partner: true, segnalazione: { select: { titolo: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSegnalazioniPerCondominio(condominioId: string) {
  return prisma.segnalazione.findMany({
    where: { immobile: { condominioId } },
    include: { creatoDa: true, immobile: true, _count: { select: { risposte: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/** Tutte le comunicazioni inviate dall'amministratore, su tutti i condomini gestiti. */
export async function getComunicazioniPerAmministratore(amministratoreId: string) {
  return prisma.comunicazioneCondominiale.findMany({
    where: { condominio: { amministratoreId } },
    include: { condominio: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getComunicazioniForCondominio(condominioId: string, amministratoreId: string) {
  const condominio = await prisma.condominio.findFirst({ where: { id: condominioId, amministratoreId } });
  if (!condominio) return [];

  return prisma.comunicazioneCondominiale.findMany({
    where: { condominioId },
    orderBy: { createdAt: "desc" },
  });
}

/** Immobili non ancora collegati a nessun condominio, candidati per "Collega immobile esistente". */
export async function getImmobiliNonAssegnati() {
  return prisma.immobile.findMany({
    where: { condominioId: null },
    include: {
      relazioni: {
        where: { ruolo: "PROPRIETARIO", stato: "ATTIVA" },
        include: { privato: { include: { user: true } } },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { indirizzo: "asc" },
  });
}

/** Agenzie esistenti tra cui l'Amministratore può scegliere quando crea un Immobile al volo. */
export async function getAgenzieDisponibili() {
  return prisma.agenzia.findMany({ orderBy: { ragioneSociale: "asc" } });
}

export async function getImmobiliPerSegnalazione(amministratoreId: string) {
  return prisma.immobile.findMany({
    where: { condominio: { amministratoreId } },
    select: {
      id: true,
      indirizzo: true,
      comune: true,
      condominioId: true,
      contratti: { where: { stato: "ATTIVO" }, select: { id: true } },
    },
    orderBy: { indirizzo: "asc" },
  });
}
