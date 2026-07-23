import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getAllParticipantsWithPlayers,
  getMatchesAsc,
  getMatchResultsById,
  getMvpStandings,
  participantWon,
} from "@/lib/data/stats";
import { getAllPlayers } from "@/lib/data/players";
import type { Player, Ruolo } from "@/lib/types";

// --- Formula di calcolo (vedi specifica prodotto) ---------------------------
const BASE_VALUE = 1.0;
const GOL_WEIGHT = 0.3;
const MEDIA_GOL_WEIGHT = 2;
const VITTORIE_WEIGHT = 0.2;
const MEDIA_VITTORIE_WEIGHT = 3;
const MVP_WEIGHT = 1.5;
const PRESENZE_WEIGHT = 0.15;
const PRESENZA_PCT_WEIGHT = 0.02;
const PRESENZA_PCT_BASELINE = 50; // % presenza sopra cui il contributo è positivo
const FORMA_MULTIPLIER = 1.2;
const RECENT_WINDOW = 5;
const MIN_VALUE = 0.1;

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
  const [matches, resultsById, participants, mvpStandings, allPlayers] = await Promise.all([
    getMatchesAsc(),
    getMatchResultsById(),
    getAllParticipantsWithPlayers(),
    getMvpStandings(),
    getAllPlayers(),
  ]);

  const totalMatches = matches.length;
  const matchIndex = new Map(matches.map((m, i) => [m.id, i]));
  const mvpByPlayer = new Map(mvpStandings.map((m) => [m.player_id, m.mvp_count]));

  const byPlayer = new Map<string, { gol: number; won: boolean; index: number }[]>();
  for (const row of participants) {
    const index = matchIndex.get(row.match_id) ?? -1;
    const won = participantWon(row, resultsById);
    const arr = byPlayer.get(row.players.id) ?? [];
    arr.push({ gol: row.gol, won, index });
    byPlayer.set(row.players.id, arr);
  }

  return allPlayers.map((player) => {
    const rows = (byPlayer.get(player.id) ?? []).slice().sort((a, b) => a.index - b.index);
    const presenze = rows.length;
    const golTotali = rows.reduce((s, r) => s + r.gol, 0);
    const vittorie = rows.filter((r) => r.won).length;
    const mediaGol = presenze > 0 ? golTotali / presenze : 0;
    const mediaVittorie = presenze > 0 ? vittorie / presenze : 0;
    const percentualePresenza = totalMatches > 0 ? presenze / totalMatches : 0;
    const mvpTotali = mvpByPlayer.get(player.id) ?? 0;

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

    const raw =
      BASE_VALUE +
      golTotali * GOL_WEIGHT +
      mediaGol * MEDIA_GOL_WEIGHT +
      vittorie * VITTORIE_WEIGHT +
      mediaVittorie * MEDIA_VITTORIE_WEIGHT +
      mvpTotali * MVP_WEIGHT +
      presenze * PRESENZE_WEIGHT +
      curvaPresenza;

    const valore = Math.max(MIN_VALUE, round1(raw * formaMultiplier));

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

export interface Top8Formation {
  difensori: MarketValue[];
  centrocampisti: MarketValue[];
  attaccanti: MarketValue[];
}

const TOP8_SLOTS: Record<Ruolo, number> = {
  difensore: 3,
  centrocampista: 3,
  attaccante: 2,
};

/**
 * Top 8 per ruolo, calcolato dal vivo sulle stesse quotazioni della pagina
 * Mercato (nessuna tabella dedicata): si aggiorna da solo ogni volta che
 * cambiano le statistiche del gruppo.
 */
export async function getTop8Formation(): Promise<Top8Formation> {
  const values = await computeMarketValues();

  const byRuolo = (ruolo: Ruolo) =>
    values
      .filter((v) => v.player.ruolo === ruolo)
      .sort((a, b) => b.valore - a.valore)
      .slice(0, TOP8_SLOTS[ruolo]);

  return {
    difensori: byRuolo("difensore"),
    centrocampisti: byRuolo("centrocampista"),
    attaccanti: byRuolo("attaccante"),
  };
}
