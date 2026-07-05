import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { getSegnalazioniNonLettePerUser } from "@/lib/data/segnalazioni";
import {
  getPagamentiInRitardoPerProprietario,
  getComunicazioniPerProprietario,
  getImmobiliForProprietario,
  calcolaScadenzeProprietario,
} from "@/lib/data/proprietario";
import { getContrattoAttivoForInquilino, getComunicazioniPerInquilino } from "@/lib/data/inquilino";
import { getPagamentiInRitardoPerAgenzia, getContrattiInScadenza } from "@/lib/data/agenzia";
import type { Role } from "@prisma/client";

/** Entro questa soglia una scadenza (contratto, registrazione AdE, assicurazione) diventa
 * una notifica: coerente con la soglia di "Rinnova" già usata per le assicurazioni. */
const GIORNI_SOGLIA_SCADENZA = 60;

export type TipoNotifica =
  | "pagamento_in_ritardo"
  | "pagamento_insoluto"
  | "scadenza_contratto"
  | "scadenza_registrazione_ade"
  | "scadenza_assicurazione"
  | "segnalazione_non_letta"
  | "comunicazione_non_letta";

export interface Notifica {
  /** Chiave univoca nella lista (prefissata per tipo, non l'id nudo dell'entità). */
  id: string;
  tipo: TipoNotifica;
  titolo: string;
  descrizione: string;
  href: string;
  data: Date;
  /** Id dell'entità sottostante: usato solo dai tipi che richiedono un'azione "segna come letta"
   * lato client (comunicazioni, che non hanno una pagina di dettaglio da visitare). */
  entitaId?: string;
}

function ordinaPerUrgenza(notifiche: Notifica[]): Notifica[] {
  return [...notifiche].sort((a, b) => a.data.getTime() - b.data.getTime());
}

/** raccogliNotifiche gira nel layout condiviso di ogni portale, quindi a ogni singola
 * navigazione (non solo nelle dashboard): senza una cache, ogni click aggiunge 3-5 query in
 * più su una connection pool già sotto pressione. Una cache in memoria di pochi secondi per
 * utente elimina le richieste ripetute durante la normale navigazione senza far percepire il
 * centro notifiche come "vecchio" (il conteggio non deve essere aggiornato al millisecondo). */
const TTL_CACHE_MS = 20_000;
const cache = new Map<string, { scadenza: number; notifiche: Notifica[] }>();

/** Punto unico di aggregazione degli allarmi sparsi nelle dashboard: dato uno userId e il suo
 * ruolo, richiama le funzioni di calcolo già esistenti per ciascuna fonte (mai duplicate qui)
 * e le normalizza in una lista piatta ordinata per urgenza/data. */
export async function raccogliNotifiche(userId: string, role: Role): Promise<Notifica[]> {
  const chiave = `${role}:${userId}`;
  const voceCache = cache.get(chiave);
  if (voceCache && voceCache.scadenza > Date.now()) {
    return voceCache.notifiche;
  }

  const notifiche = await calcolaNotifiche(userId, role);
  cache.set(chiave, { scadenza: Date.now() + TTL_CACHE_MS, notifiche });
  return notifiche;
}

async function calcolaNotifiche(userId: string, role: Role): Promise<Notifica[]> {
  switch (role) {
    case "PROPRIETARIO":
      return raccogliNotifichePerProprietario(userId);
    case "INQUILINO":
      return raccogliNotifichePerInquilino(userId);
    case "AGENZIA":
      return raccogliNotifichePerAgenzia(userId);
    case "AMMINISTRATORE":
      return raccogliNotifichePerAmministratore(userId);
    default:
      return [];
  }
}

async function raccogliNotifichePerProprietario(userId: string): Promise<Notifica[]> {
  const proprietario = await prisma.proprietario.findUnique({ where: { userId } });
  if (!proprietario) return [];

  const [pagamentiInRitardo, immobili, comunicazioni, segnalazioniNonLette] = await Promise.all([
    getPagamentiInRitardoPerProprietario(proprietario.id),
    getImmobiliForProprietario(proprietario.id),
    getComunicazioniPerProprietario(proprietario.id, userId),
    getSegnalazioniNonLettePerUser(userId),
  ]);

  const notifiche: Notifica[] = [];

  for (const p of pagamentiInRitardo) {
    notifiche.push({
      id: `pagamento-${p.id}`,
      tipo: p.stato === "INSOLUTO" ? "pagamento_insoluto" : "pagamento_in_ritardo",
      titolo: p.stato === "INSOLUTO" ? "Pagamento insoluto" : "Pagamento in ritardo",
      descrizione: `${p.contratto.immobile.indirizzo}, ${p.contratto.immobile.comune} — ${formatCurrency(p.importo)}`,
      href: "/proprietario/pagamenti",
      data: p.dataScadenza,
    });
  }

  const scadenze = calcolaScadenzeProprietario(immobili).filter(
    (s) => differenceInCalendarDays(s.data, new Date()) <= GIORNI_SOGLIA_SCADENZA
  );
  const TIPO_SCADENZA: Record<string, TipoNotifica> = {
    "Rinnovo contratto": "scadenza_contratto",
    "Rinnovo registrazione AdE": "scadenza_registrazione_ade",
    "Scadenza assicurazione": "scadenza_assicurazione",
  };
  for (const s of scadenze) {
    notifiche.push({
      id: `scadenza-${s.immobileId}-${s.tipo}-${s.data.getTime()}`,
      tipo: TIPO_SCADENZA[s.tipo] ?? "scadenza_contratto",
      titolo: s.tipo,
      descrizione: s.immobile,
      href: `/proprietario/immobili/${s.immobileId}`,
      data: s.data,
    });
  }

  for (const c of comunicazioni) {
    if (c.letture.length > 0) continue;
    notifiche.push({
      id: `comunicazione-${c.id}`,
      tipo: "comunicazione_non_letta",
      titolo: "Comunicazione condominiale",
      descrizione: c.titolo,
      href: "/proprietario",
      data: c.createdAt,
      entitaId: c.id,
    });
  }

  for (const d of segnalazioniNonLette) {
    notifiche.push({
      id: `segnalazione-${d.segnalazione.id}`,
      tipo: "segnalazione_non_letta",
      titolo: "Segnalazione non letta",
      descrizione: `${d.segnalazione.titolo} — ${d.segnalazione.immobile.indirizzo}, ${d.segnalazione.immobile.comune}`,
      href: `/proprietario/segnalazioni/${d.segnalazione.id}`,
      data: d.segnalazione.createdAt,
    });
  }

  return ordinaPerUrgenza(notifiche);
}

async function raccogliNotifichePerInquilino(userId: string): Promise<Notifica[]> {
  const inquilino = await prisma.inquilino.findUnique({ where: { userId } });
  if (!inquilino) return [];

  const [contratto, segnalazioniNonLette] = await Promise.all([
    getContrattoAttivoForInquilino(inquilino.id),
    getSegnalazioniNonLettePerUser(userId),
  ]);

  const notifiche: Notifica[] = [];

  if (contratto) {
    const pagamentiInRitardo = contratto.pagamenti.filter((p) => p.stato === "IN_RITARDO" || p.stato === "INSOLUTO");
    for (const p of pagamentiInRitardo) {
      notifiche.push({
        id: `pagamento-${p.id}`,
        tipo: p.stato === "INSOLUTO" ? "pagamento_insoluto" : "pagamento_in_ritardo",
        titolo: p.stato === "INSOLUTO" ? "Pagamento insoluto" : "Pagamento in ritardo",
        descrizione: formatCurrency(p.importo),
        href: "/inquilino/pagamenti#storico-pagamenti",
        data: p.dataScadenza,
      });
    }

    const comunicazioni = await getComunicazioniPerInquilino(contratto.immobile.condominioId, userId);
    for (const c of comunicazioni) {
      if (c.letture.length > 0) continue;
      notifiche.push({
        id: `comunicazione-${c.id}`,
        tipo: "comunicazione_non_letta",
        titolo: "Comunicazione condominiale",
        descrizione: c.titolo,
        href: "/inquilino",
        data: c.createdAt,
        entitaId: c.id,
      });
    }
  }

  for (const d of segnalazioniNonLette) {
    notifiche.push({
      id: `segnalazione-${d.segnalazione.id}`,
      tipo: "segnalazione_non_letta",
      titolo: "Segnalazione non letta",
      descrizione: d.segnalazione.titolo,
      href: `/inquilino/segnalazioni/${d.segnalazione.id}`,
      data: d.segnalazione.createdAt,
    });
  }

  return ordinaPerUrgenza(notifiche);
}

async function raccogliNotifichePerAgenzia(userId: string): Promise<Notifica[]> {
  const agenzia = await prisma.agenzia.findUnique({ where: { userId } });
  if (!agenzia) return [];

  const [pagamentiInRitardo, contrattiInScadenza, segnalazioniNonLette] = await Promise.all([
    getPagamentiInRitardoPerAgenzia(agenzia.id),
    getContrattiInScadenza(agenzia.id, GIORNI_SOGLIA_SCADENZA),
    getSegnalazioniNonLettePerUser(userId),
  ]);

  const notifiche: Notifica[] = [];

  for (const p of pagamentiInRitardo) {
    notifiche.push({
      id: `pagamento-${p.id}`,
      tipo: p.stato === "INSOLUTO" ? "pagamento_insoluto" : "pagamento_in_ritardo",
      titolo: p.stato === "INSOLUTO" ? "Pagamento insoluto" : "Pagamento in ritardo",
      descrizione: `${p.contratto.immobile.indirizzo}, ${p.contratto.immobile.comune} — ${formatCurrency(p.importo)}`,
      href: "/agenzia",
      data: p.dataScadenza,
    });
  }

  for (const c of contrattiInScadenza) {
    notifiche.push({
      id: `scadenza-contratto-${c.id}`,
      tipo: "scadenza_contratto",
      titolo: "Rinnovo contratto",
      descrizione: `${c.immobile.indirizzo}, ${c.immobile.comune}`,
      href: `/agenzia/contratti/${c.id}`,
      data: c.dataFine,
    });
  }

  for (const d of segnalazioniNonLette) {
    notifiche.push({
      id: `segnalazione-${d.segnalazione.id}`,
      tipo: "segnalazione_non_letta",
      titolo: "Segnalazione non letta",
      descrizione: `${d.segnalazione.titolo} — ${d.segnalazione.immobile.indirizzo}, ${d.segnalazione.immobile.comune}`,
      href: `/agenzia/segnalazioni/${d.segnalazione.id}`,
      data: d.segnalazione.createdAt,
    });
  }

  return ordinaPerUrgenza(notifiche);
}

async function raccogliNotifichePerAmministratore(userId: string): Promise<Notifica[]> {
  const segnalazioniNonLette = await getSegnalazioniNonLettePerUser(userId);

  const notifiche: Notifica[] = segnalazioniNonLette.map((d) => ({
    id: `segnalazione-${d.segnalazione.id}`,
    tipo: "segnalazione_non_letta" as const,
    titolo: "Segnalazione non letta",
    descrizione: `${d.segnalazione.titolo} — ${d.segnalazione.immobile.indirizzo}, ${d.segnalazione.immobile.comune}`,
    href: `/amministratore/segnalazioni/${d.segnalazione.id}`,
    data: d.segnalazione.createdAt,
  }));

  return ordinaPerUrgenza(notifiche);
}
