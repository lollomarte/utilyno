import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getAllParticipantsWithPlayers,
  getMatchesAsc,
  getMatchResultsById,
  participantWon,
} from "@/lib/data/stats";
import { getAllPlayers } from "@/lib/data/players";
import type { Player, Ruolo } from "@/lib/types";

// --- Formula di calcolo (vedi specifica prodotto) ---------------------------
const BASE_VALUE = 1.0;
// Moltiplicatore gol_totali differenziato per ruolo: gli attaccanti fanno gol
// "di mestiere" quindi pesano meno il singolo gol, i difensori pesano di più
// perché segnare è più raro per loro. Centrocampista funge anche da default
// neutro per chi non ha un ruolo assegnato.
const GOL_WEIGHT_BY_RUOLO: Record<Ruolo, number> = {
  attaccante: 0.3,
  centrocampista: 0.5,
  difensore: 0.8,
};
const DEFAULT_GOL_WEIGHT = GOL_WEIGHT_BY_RUOLO.centrocampista;
const MEDIA_GOL_WEIGHT = 2;
const VITTORIE_WEIGHT = 0.35;
const MEDIA_VITTORIE_WEIGHT = 5;
const PRESENZE_WEIGHT = 0.3;
const PRESENZA_PCT_WEIGHT = 0.02;
const PRESENZA_PCT_BASELINE = 50; // % presenza sopra cui il contributo è positivo
const FORMA_MULTIPLIER = 1.2;
const RECENT_WINDOW = 5;
const MIN_VALUE = 0.1;
// Bonus/penalità portiere: termine indipendente, uguale per tutti i ruoli,
// sommato in fondo alla formula (vedi bonusPortiereTotale in computeMarketValues).
// La penalità è la metà del bonus per non scoraggiare chi si offre volontario in porta.
const PORTIERE_BONUS_WEIGHT = 0.8;
const PORTIERE_PENALTY_WEIGHT = 0.4;

export interface MarketValue {
  player: Player;
  valore: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Calcola dal vivo il valore di mercato di ogni giocatore registrato dalle
 * statistiche esistenti (nessuna tabella dedicata per i dati grezzi).
 *
 * "Forma recente": la spec definisce il bonus come "rendimento (gol/vittorie)
 * nelle ultime 5 partite superiore alla media personale complessiva". Qui il
 * rendimento è la somma di gol/partita + vittorie/partita, confrontata sulla
 * stessa base tra la finestra recente e l'intera carriera del giocatore.
 */
export async function computeMarketValues(): Promise<MarketValue[]> {
  const [matches, resultsById, participants, allPlayers] = await Promise.all([
    getMatchesAsc(),
    getMatchResultsById(),
    getAllParticipantsWithPlayers(),
    getAllPlayers(),
  ]);

  const totalMatches = matches.length;
  const matchIndex = new Map(matches.map((m, i) => [m.id, i]));

  // Media gol subiti per squadra a partita nel gruppo = media gol totali a
  // partita / 2 (ogni partita ha due squadre). Base per il bonus/penalità portiere.
  let totalGoalsSum = 0;
  let matchesWithResult = 0;
  for (const m of matches) {
    const r = resultsById.get(m.id);
    if (!r) continue;
    totalGoalsSum += r.gol_bianca + r.gol_nera;
    matchesWithResult++;
  }
  const groupAvgConcededPerTeam = matchesWithResult > 0 ? totalGoalsSum / matchesWithResult / 2 : 0;

  const byPlayer = new Map<string, { gol: number; won: boolean; index: number }[]>();
  const portiereGolSubitiByPlayer = new Map<string, number[]>();
  for (const row of participants) {
    const index = matchIndex.get(row.match_id) ?? -1;
    const won = participantWon(row, resultsById);
    const arr = byPlayer.get(row.players.id) ?? [];
    arr.push({ gol: row.gol, won, index });
    byPlayer.set(row.players.id, arr);

    if (row.portiere) {
      const result = resultsById.get(row.match_id);
      if (result) {
        const golSubiti = row.squadra === "bianca" ? result.gol_nera : result.gol_bianca;
        const arr2 = portiereGolSubitiByPlayer.get(row.players.id) ?? [];
        arr2.push(golSubiti);
        portiereGolSubitiByPlayer.set(row.players.id, arr2);
      }
    }
  }

  function bonusPortiereTotale(playerId: string): number {
    const golSubitiRows = portiereGolSubitiByPlayer.get(playerId) ?? [];
    return golSubitiRows.reduce((sum, golSubiti) => {
      if (golSubiti < groupAvgConcededPerTeam) {
        return sum + (groupAvgConcededPerTeam - golSubiti) * PORTIERE_BONUS_WEIGHT;
      }
      if (golSubiti > groupAvgConcededPerTeam) {
        return sum - (golSubiti - groupAvgConcededPerTeam) * PORTIERE_PENALTY_WEIGHT;
      }
      return sum;
    }, 0);
  }

  return allPlayers.map((player) => {
    const rows = (byPlayer.get(player.id) ?? []).slice().sort((a, b) => a.index - b.index);
    const presenze = rows.length;
    const golTotali = rows.reduce((s, r) => s + r.gol, 0);
    const vittorie = rows.filter((r) => r.won).length;
    const mediaGol = presenze > 0 ? golTotali / presenze : 0;
    const mediaVittorie = presenze > 0 ? vittorie / presenze : 0;
    const percentualePresenza = totalMatches > 0 ? presenze / totalMatches : 0;

    const recentRows = rows.slice(-RECENT_WINDOW);
    const recentCount = recentRows.length;
    const recentMediaGol = recentCount > 0 ? recentRows.reduce((s, r) => s + r.gol, 0) / recentCount : 0;
    const recentMediaVittorie =
      recentCount > 0 ? recentRows.filter((r) => r.won).length / recentCount : 0;

    const formaMultiplier =
      recentCount > 0 && recentMediaGol + recentMediaVittorie > mediaGol + mediaVittorie
        ? FORMA_MULTIPLIER
        : 1;

    const curvaPresenza = (percentualePresenza * 100 - PRESENZA_PCT_BASELINE) * PRESENZA_PCT_WEIGHT;
    const golWeight = player.ruolo ? GOL_WEIGHT_BY_RUOLO[player.ruolo] : DEFAULT_GOL_WEIGHT;

    const raw =
      BASE_VALUE +
      golTotali * golWeight +
      mediaGol * MEDIA_GOL_WEIGHT +
      vittorie * VITTORIE_WEIGHT +
      mediaVittorie * MEDIA_VITTORIE_WEIGHT +
      presenze * PRESENZE_WEIGHT +
      curvaPresenza;

    const valorePerRuolo = Math.max(MIN_VALUE, round1(raw * formaMultiplier));
    const valore = Math.max(MIN_VALUE, round1(valorePerRuolo + bonusPortiereTotale(player.id)));

    return { player, valore };
  });
}

function currentMonthKey(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** Crea lo snapshot del mese corrente se manca. Usa la service role perché
 *  è un job di sistema, non un'azione dell'utente: RLS su market_values non
 *  concede scrittura ad anon/authenticated. */
async function ensureCurrentMonthSnapshot(values: MarketValue[]): Promise<void> {
  if (values.length === 0) return;
  const service = createServiceClient();
  const data_calcolo = currentMonthKey();
  const rows = values.map((v) => ({ player_id: v.player.id, valore: v.valore, data_calcolo }));
  const { error } = await service
    .from("market_values")
    .upsert(rows, { onConflict: "player_id,data_calcolo", ignoreDuplicates: true });
  if (error) throw error;
}

export interface MarketPlayerRow {
  player: Player;
  valore: number;
  trend: number | null;
  sparkline: number[];
}

export interface MarketPageData {
  players: MarketPlayerRow[];
  topRisers: MarketPlayerRow[];
  topFallers: MarketPlayerRow[];
  groupTrend: number[];
  hasHistory: boolean;
}

export async function getMarketPageData(): Promise<MarketPageData> {
  const currentValues = await computeMarketValues();
  await ensureCurrentMonthSnapshot(currentValues);

  const monthKey = currentMonthKey();
  const supabase = await createClient();
  const { data: snapshots, error } = await supabase
    .from("market_values")
    .select("player_id, valore, data_calcolo")
    .order("data_calcolo", { ascending: true });
  if (error) throw error;

  const byPlayerHistory = new Map<string, number[]>();
  const byDateValues = new Map<string, number[]>();
  for (const row of snapshots ?? []) {
    const valore = Number(row.valore);
    const hist = byPlayerHistory.get(row.player_id) ?? [];
    hist.push(valore);
    byPlayerHistory.set(row.player_id, hist);

    const dateArr = byDateValues.get(row.data_calcolo) ?? [];
    dateArr.push(valore);
    byDateValues.set(row.data_calcolo, dateArr);
  }

  const pastDates = Array.from(byDateValues.keys())
    .filter((d) => d < monthKey)
    .sort();
  const previousDate = pastDates[pastDates.length - 1] ?? null;

  const previousByPlayer = new Map<string, number>();
  if (previousDate) {
    for (const row of snapshots ?? []) {
      if (row.data_calcolo === previousDate) previousByPlayer.set(row.player_id, Number(row.valore));
    }
  }

  const players: MarketPlayerRow[] = currentValues
    .map(({ player, valore }) => {
      const history = byPlayerHistory.get(player.id) ?? [];
      const previousValore = previousByPlayer.get(player.id) ?? null;
      return {
        player,
        valore,
        trend: previousValore !== null ? round1(valore - previousValore) : null,
        sparkline: [...history, valore],
      };
    })
    .sort((a, b) => b.valore - a.valore);

  const withTrend = players.filter((r) => r.trend !== null && r.trend !== 0);
  const topRisers = [...withTrend]
    .filter((r) => (r.trend ?? 0) > 0)
    .sort((a, b) => (b.trend ?? 0) - (a.trend ?? 0))
    .slice(0, 3);
  const topFallers = [...withTrend]
    .filter((r) => (r.trend ?? 0) < 0)
    .sort((a, b) => (a.trend ?? 0) - (b.trend ?? 0))
    .slice(0, 3);

  const groupTrendDates = Array.from(byDateValues.keys()).sort();
  const groupTrend = groupTrendDates.map((d) => {
    const vals = byDateValues.get(d)!;
    return round1(vals.reduce((s, v) => s + v, 0) / vals.length);
  });
  const liveAvg =
    currentValues.length > 0
      ? round1(currentValues.reduce((s, c) => s + c.valore, 0) / currentValues.length)
      : 0;
  groupTrend.push(liveAvg);

  return {
    players,
    topRisers,
    topFallers,
    groupTrend,
    hasHistory: previousDate !== null,
  };
}

/**
 * Pool di giocatori attivi con il loro valore di mercato attuale, usato dal
 * generatore di formazione bilanciata. Nessuna tabella dedicata: i valori
 * sono quelli calcolati dal vivo dalle statistiche esistenti.
 */
export async function getFormationGeneratorPool(): Promise<MarketValue[]> {
  const values = await computeMarketValues();
  return values
    .filter((v) => v.player.attivo)
    .sort(
      (a, b) =>
        a.player.cognome.localeCompare(b.player.cognome) || a.player.nome.localeCompare(b.player.nome)
    );
}

export interface Top8Formation {
  difensori: MarketValue[];
  centrocampisti: MarketValue[];
  attaccanti: MarketValue[];
}

export interface Top8Formations {
  principale: Top8Formation;
  /** I giocatori immediatamente successivi alla Top 8 principale per ogni ruolo. */
  serieB: Top8Formation;
}

const TOP8_SLOTS: Record<Ruolo, number> = {
  difensore: 3,
  centrocampista: 3,
  attaccante: 2,
};

/**
 * Top 8 principale + "Serie B" (i successivi in classifica per ruolo, senza
 * sovrapposizioni), calcolate dal vivo sulle stesse quotazioni della pagina
 * Mercato (nessuna tabella dedicata): si aggiornano da sole ogni volta che
 * cambiano le statistiche del gruppo.
 */
export async function getTop8Formation(): Promise<Top8Formations> {
  const values = await computeMarketValues();

  const sortedByRuolo = (ruolo: Ruolo) =>
    values.filter((v) => v.player.ruolo === ruolo).sort((a, b) => b.valore - a.valore);

  const byRuolo = (ruolo: Ruolo, start: number) =>
    sortedByRuolo(ruolo).slice(start, start + TOP8_SLOTS[ruolo]);

  const buildFrom = (offset: (ruolo: Ruolo) => number): Top8Formation => ({
    difensori: byRuolo("difensore", offset("difensore")),
    centrocampisti: byRuolo("centrocampista", offset("centrocampista")),
    attaccanti: byRuolo("attaccante", offset("attaccante")),
  });

  return {
    principale: buildFrom(() => 0),
    serieB: buildFrom((ruolo) => TOP8_SLOTS[ruolo]),
  };
}
