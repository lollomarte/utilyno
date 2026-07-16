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
import { getPagamentiInRitardoPerAgenzia, getContrattiInScadenza, getRichiesteGestionePerAgenzia } from "@/lib/data/agenzia";

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
  | "comunicazione_non_letta"
  | "richiesta_gestione_ricevuta";

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

/** Punto unico di aggregazione degli allarmi sparsi nelle dashboard: dato uno userId, verifica
 * quali profili possiede (un utente può averne più di uno, es. Proprietario e Inquilino
 * contemporaneamente) e aggrega le notifiche di ciascuno — mai duplicate qui. */
export async function raccogliNotifiche(userId: string): Promise<Notifica[]> {
  const voceCache = cache.get(userId);
  if (voceCache && voceCache.scadenza > Date.now()) {
    return voceCache.notifiche;
  }

  const notifiche = await calcolaNotifiche(userId);
  cache.set(userId, { scadenza: Date.now() + TTL_CACHE_MS, notifiche });
  return notifiche;
}

async function calcolaNotifiche(userId: string): Promise<Notifica[]> {
  // Una sola query invece di 4 findUnique separati: raccogliNotifiche gira a ogni navigazione
  // in ogni portale, e il pool di connessioni verso Neon in questo ambiente è volutamente
  // piccolo (pgbouncer, connection_limit=5) — moltiplicare le query qui esaurisce il pool
  // sotto carico concorrente.
  const utente = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      proprietario: { select: { id: true } },
      inquilino: { select: { id: true } },
      agenzia: { select: { id: true } },
      amministratore: { select: { id: true } },
    },
  });
  if (!utente) return [];

  const gruppi = await Promise.all([
    utente.proprietario ? raccogliNotifichePerProprietario(userId, utente.proprietario.id) : [],
    utente.inquilino ? raccogliNotifichePerInquilino(userId, utente.inquilino.id) : [],
    utente.agenzia ? raccogliNotifichePerAgenzia(userId, utente.agenzia.id) : [],
    utente.amministratore ? raccogliNotifichePerAmministratore(userId) : [],
  ]);

  return ordinaPerUrgenza(gruppi.flat());
}

async function raccogliNotifichePerProprietario(userId: string, proprietarioId: string): Promise<Notifica[]> {
  const [pagamentiInRitardo, immobili, comunicazioni, segnalazioniNonLetteTutte] = await Promise.all([
    getPagamentiInRitardoPerProprietario(proprietarioId),
    getImmobiliForProprietario(proprietarioId),
    getComunicazioniPerProprietario(proprietarioId, userId),
    getSegnalazioniNonLettePerUser(userId),
  ]);
  // Un utente con anche il profilo Inquilino riceve la stessa lista grezza dall'altro branch:
  // qui va filtrata solo agli immobili di cui è effettivamente proprietario, altrimenti una
  // segnalazione su un immobile in cui è inquilino comparirebbe anche con link "/proprietario/...".
  const segnalazioniNonLette = segnalazioniNonLetteTutte.filter(
    (d) => d.segnalazione.immobile.proprietarioId === proprietarioId
  );

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

async function raccogliNotifichePerInquilino(userId: string, inquilinoId: string): Promise<Notifica[]> {
  const [contratto, contrattiAttivi, segnalazioniNonLetteTutte] = await Promise.all([
    getContrattoAttivoForInquilino(inquilinoId),
    prisma.contratto.findMany({ where: { inquilinoId, stato: "ATTIVO" }, select: { immobileId: true } }),
    getSegnalazioniNonLettePerUser(userId),
  ]);
  // Stesso filtro del branch Proprietario: un utente con anche quel profilo riceverebbe altrimenti
  // le stesse segnalazioni due volte, la seconda con un link "/inquilino/..." non pertinente.
  const immobiliInAffitto = new Set(contrattiAttivi.map((c) => c.immobileId));
  const segnalazioniNonLette = segnalazioniNonLetteTutte.filter((d) => immobiliInAffitto.has(d.segnalazione.immobileId));

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

async function raccogliNotifichePerAgenzia(userId: string, agenziaId: string): Promise<Notifica[]> {
  const [pagamentiInRitardo, contrattiInScadenza, segnalazioniNonLette, richiesteGestione] = await Promise.all([
    getPagamentiInRitardoPerAgenzia(agenziaId),
    getContrattiInScadenza(agenziaId, GIORNI_SOGLIA_SCADENZA),
    getSegnalazioniNonLettePerUser(userId),
    getRichiesteGestionePerAgenzia(agenziaId),
  ]);

  const notifiche: Notifica[] = [];

  for (const r of richiesteGestione) {
    if (r.stato !== "IN_ATTESA") continue;
    notifiche.push({
      id: `richiesta-gestione-${r.id}`,
      tipo: "richiesta_gestione_ricevuta",
      titolo: "Richiesta di gestione immobile",
      descrizione: `${r.proprietario.user.nome} ${r.proprietario.user.cognome} — ${r.immobile.indirizzo}, ${r.immobile.comune}`,
      href: "/agenzia/richieste-gestione",
      data: r.dataRichiesta,
    });
  }

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
