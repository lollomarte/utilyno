import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { getSegnalazioniNonLettePerUser } from "@/lib/data/segnalazioni";
import {
  getPagamentiInRitardoPerProprietario,
  getComunicazioniPerProprietario,
  getImmobiliForProprietario,
  calcolaScadenzeProprietario,
  getContrattoAttivoForInquilino,
  getComunicazioniPerInquilino,
} from "@/lib/data/privato";
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
 * quale profilo possiede e aggrega le notifiche di ciascun ruolo che ricopre (un Privato può
 * essere proprietario di un immobile e inquilino di un altro contemporaneamente) — mai
 * duplicate qui. */
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
      privato: { select: { id: true } },
      agenzia: { select: { id: true } },
      amministratore: { select: { id: true } },
    },
  });
  if (!utente) return [];

  // Proprietario e inquilino non sono più due profili distinti da controllare: un solo Privato
  // può ricoprire entrambi i ruoli (su immobili diversi), quindi si interrogano sempre entrambi
  // i branch con lo stesso privato.id — ciascuno restituisce semplicemente un array vuoto se il
  // privato non ha relazioni di quel ruolo.
  const gruppi = await Promise.all([
    utente.privato ? raccogliNotifichePerProprietario(userId, utente.privato.id) : [],
    utente.privato ? raccogliNotifichePerInquilino(userId, utente.privato.id) : [],
    utente.agenzia ? raccogliNotifichePerAgenzia(userId, utente.agenzia.id) : [],
    utente.amministratore ? raccogliNotifichePerAmministratore(userId) : [],
  ]);

  return ordinaPerUrgenza(gruppi.flat());
}

async function raccogliNotifichePerProprietario(userId: string, privatoId: string): Promise<Notifica[]> {
  const [pagamentiInRitardo, immobili, comunicazioni, segnalazioniNonLetteTutte] = await Promise.all([
    getPagamentiInRitardoPerProprietario(privatoId),
    getImmobiliForProprietario(privatoId),
    getComunicazioniPerProprietario(privatoId, userId),
    getSegnalazioniNonLettePerUser(userId),
  ]);
  // Un privato con anche il ruolo inquilino (su un altro immobile) riceve la stessa lista grezza
  // dall'altro branch: qui va filtrata solo agli immobili di cui è effettivamente proprietario,
  // altrimenti una segnalazione su un immobile in cui è inquilino comparirebbe due volte.
  const immobiliDiProprieta = new Set(immobili.map((i) => i.id));
  const segnalazioniNonLette = segnalazioniNonLetteTutte.filter((d) => immobiliDiProprieta.has(d.segnalazione.immobileId));

  const notifiche: Notifica[] = [];

  for (const p of pagamentiInRitardo) {
    notifiche.push({
      id: `pagamento-${p.id}`,
      tipo: p.stato === "INSOLUTO" ? "pagamento_insoluto" : "pagamento_in_ritardo",
      titolo: p.stato === "INSOLUTO" ? "Pagamento insoluto" : "Pagamento in ritardo",
      descrizione: `${p.contratto.immobile.indirizzo}, ${p.contratto.immobile.comune} — ${formatCurrency(p.importo)}`,
      href: `/privato/${p.contratto.immobileId}/pagamenti`,
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
      href: `/privato/${s.immobileId}`,
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
      href: "/privato",
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
      href: `/privato/segnalazioni/${d.segnalazione.id}`,
      data: d.segnalazione.createdAt,
    });
  }

  return ordinaPerUrgenza(notifiche);
}

async function raccogliNotifichePerInquilino(userId: string, privatoId: string): Promise<Notifica[]> {
  const [contratto, contrattiAttivi, segnalazioniNonLetteTutte] = await Promise.all([
    getContrattoAttivoForInquilino(privatoId),
    prisma.contratto.findMany({ where: { inquilinoId: privatoId, stato: "ATTIVO" }, select: { immobileId: true } }),
    getSegnalazioniNonLettePerUser(userId),
  ]);
  // Stesso filtro del branch proprietario: un privato con anche quel ruolo (su un altro
  // immobile) riceverebbe altrimenti le stesse segnalazioni due volte.
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
        href: `/privato/${contratto.immobileId}/pagamenti#storico-pagamenti`,
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
        href: `/privato/${contratto.immobileId}`,
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
      href: `/privato/segnalazioni/${d.segnalazione.id}`,
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
