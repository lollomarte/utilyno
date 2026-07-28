// Calcolo puro (nessuna dipendenza Supabase) di tutti i record della pagina
// Record, a partire dai dati grezzi già fetchati da lib/data/records.ts.
// Stesso pattern di lib/yearStats.ts e lib/playerProfileStats.ts: separato
// per essere testabile senza rete e riusabile lato server.
import { currentStreak, longestStreak } from "@/lib/playerProfileStats";
import { participantWon } from "@/lib/data/stats";
import { monthLabel } from "@/lib/format";
import type { MatchResult, Player, Squadra } from "@/lib/types";
import type { YearTaggedParticipant } from "@/lib/yearStats";

export type PlayerLite = Pick<Player, "id" | "nome" | "cognome" | "foto_url">;

export interface PlayerHolderRecord {
  value: number;
  holders: PlayerLite[];
}

export interface MatchRecord {
  value: number;
  matches: { matchId: string; data: string; golBianca: number; golNera: number }[];
}

export interface PairRecord {
  value: number;
  pairs: { a: PlayerLite; b: PlayerLite }[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// --- Numeri del gruppo -------------------------------------------------------

export interface GroupTotals {
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
}

export function computeGroupTotals(totalMatches: number, results: MatchResult[]): GroupTotals {
  const totalGoals = results.reduce((s, r) => s + r.gol_bianca + r.gol_nera, 0);
  return {
    totalMatches,
    totalGoals,
    avgGoalsPerMatch: totalMatches > 0 ? round2(totalGoals / totalMatches) : 0,
  };
}

export interface YearGoalLeader {
  player: PlayerLite;
  year: string;
  gol: number;
}

export interface CurrentYearVsRecord {
  currentYear: string;
  currentYearLeaders: YearGoalLeader[];
  currentYearGoals: number;
  recordYear: { gol: number; leaders: YearGoalLeader[] } | null;
}

export function computeCurrentYearVsRecordYear(
  rows: YearTaggedParticipant[],
  currentYear: string
): CurrentYearVsRecord {
  const byYearPlayer = new Map<string, Map<string, { player: PlayerLite; gol: number }>>();
  for (const row of rows) {
    const yearMap = byYearPlayer.get(row.year) ?? new Map<string, { player: PlayerLite; gol: number }>();
    const entry = yearMap.get(row.player.id) ?? { player: row.player, gol: 0 };
    entry.gol += row.gol;
    yearMap.set(row.player.id, entry);
    byYearPlayer.set(row.year, yearMap);
  }

  function topOfYear(year: string): YearGoalLeader[] {
    const yearMap = byYearPlayer.get(year);
    if (!yearMap || yearMap.size === 0) return [];
    const max = Math.max(...Array.from(yearMap.values()).map((e) => e.gol));
    if (max <= 0) return [];
    return Array.from(yearMap.values())
      .filter((e) => e.gol === max)
      .map((e) => ({ player: e.player, year, gol: e.gol }));
  }

  const currentYearLeaders = topOfYear(currentYear);

  let recordGol = 0;
  let recordLeaders: YearGoalLeader[] = [];
  for (const year of byYearPlayer.keys()) {
    const leaders = topOfYear(year);
    if (leaders.length === 0) continue;
    const gol = leaders[0].gol;
    if (gol > recordGol) {
      recordGol = gol;
      recordLeaders = leaders;
    } else if (gol === recordGol) {
      recordLeaders = [...recordLeaders, ...leaders];
    }
  }

  return {
    currentYear,
    currentYearLeaders,
    currentYearGoals: currentYearLeaders[0]?.gol ?? 0,
    recordYear: recordLeaders.length > 0 ? { gol: recordGol, leaders: recordLeaders } : null,
  };
}

// --- Record individuali: singola partita -------------------------------------

export interface SingleMatchGoalEntry {
  player: PlayerLite;
  matchId: string;
  data: string;
}

export function computeRecordGoliPartita(
  participants: { match_id: string; gol: number; players: PlayerLite }[],
  matchDateById: Map<string, string>
): { gol: number; entries: SingleMatchGoalEntry[] } | null {
  if (participants.length === 0) return null;
  const max = Math.max(...participants.map((p) => p.gol));
  if (max <= 0) return null;
  const entries = participants
    .filter((p) => p.gol === max)
    .map((p) => ({ player: p.players, matchId: p.match_id, data: matchDateById.get(p.match_id) ?? "" }));
  return { gol: max, entries };
}

// --- Record individuali: strisce e continuità ---------------------------------

interface ParticipantRow {
  match_id: string;
  squadra: Squadra;
  players: PlayerLite;
}

function streakRecordAcrossPlayers(
  participants: { match_id: string; players: PlayerLite }[],
  matchIndexById: Map<string, number>,
  predicate: (row: { match_id: string }) => boolean
): PlayerHolderRecord | null {
  const byPlayer = new Map<string, { player: PlayerLite; rows: { index: number; ok: boolean }[] }>();
  for (const row of participants) {
    const entry = byPlayer.get(row.players.id) ?? { player: row.players, rows: [] };
    entry.rows.push({ index: matchIndexById.get(row.match_id) ?? -1, ok: predicate(row) });
    byPlayer.set(row.players.id, entry);
  }

  let best = 0;
  let holders = new Map<string, PlayerLite>();
  for (const [id, { player, rows }] of byPlayer) {
    const asc = [...rows].sort((a, b) => a.index - b.index);
    const streak = longestStreak(asc, (r) => r.ok);
    if (streak > best) {
      best = streak;
      holders = new Map([[id, player]]);
    } else if (streak === best && streak > 0) {
      holders.set(id, player);
    }
  }

  if (best === 0) return null;
  return { value: best, holders: Array.from(holders.values()) };
}

export function computeWinStreakRecord(
  participants: ParticipantRow[],
  resultsById: Map<string, { gol_bianca: number; gol_nera: number }>,
  matchIndexById: Map<string, number>
): PlayerHolderRecord | null {
  return streakRecordAcrossPlayers(participants, matchIndexById, (row) =>
    participantWon(row as { match_id: string; squadra: Squadra }, resultsById)
  );
}

function outcomeOf(
  row: { match_id: string; squadra: Squadra },
  resultsById: Map<string, { gol_bianca: number; gol_nera: number }>
): "win" | "draw" | "loss" {
  const r = resultsById.get(row.match_id);
  if (!r || r.gol_bianca === r.gol_nera) return "draw";
  const winningSquadra = r.gol_bianca > r.gol_nera ? "bianca" : "nera";
  return row.squadra === winningSquadra ? "win" : "loss";
}

export function computeUnbeatenStreakRecord(
  participants: ParticipantRow[],
  resultsById: Map<string, { gol_bianca: number; gol_nera: number }>,
  matchIndexById: Map<string, number>
): PlayerHolderRecord | null {
  return streakRecordAcrossPlayers(
    participants,
    matchIndexById,
    (row) => outcomeOf(row as { match_id: string; squadra: Squadra }, resultsById) !== "loss"
  );
}

export function computeLossStreakRecord(
  participants: ParticipantRow[],
  resultsById: Map<string, { gol_bianca: number; gol_nera: number }>,
  matchIndexById: Map<string, number>
): PlayerHolderRecord | null {
  return streakRecordAcrossPlayers(
    participants,
    matchIndexById,
    (row) => outcomeOf(row as { match_id: string; squadra: Squadra }, resultsById) === "loss"
  );
}

const DIGIUNO_MIN_GOL_CARRIERA = 10;

interface GoalParticipantRow {
  match_id: string;
  gol: number;
  players: PlayerLite;
}

/** Striscia di partite consecutive senza segnare, calcolata solo su chi ha
 *  almeno DIGIUNO_MIN_GOL_CARRIERA gol in carriera: altrimenti il record
 *  coinciderebbe semplicemente con "chi non segna mai", non un vero digiuno. */
export function computeDigiunoRecord(
  participants: GoalParticipantRow[],
  matchIndexById: Map<string, number>
): (PlayerHolderRecord & { minGolCarriera: number }) | null {
  const careerGoals = new Map<string, number>();
  for (const row of participants) {
    careerGoals.set(row.players.id, (careerGoals.get(row.players.id) ?? 0) + row.gol);
  }

  const byPlayer = new Map<string, { player: PlayerLite; rows: { index: number; gol: number }[] }>();
  for (const row of participants) {
    const entry = byPlayer.get(row.players.id) ?? { player: row.players, rows: [] };
    entry.rows.push({ index: matchIndexById.get(row.match_id) ?? -1, gol: row.gol });
    byPlayer.set(row.players.id, entry);
  }

  let best = 0;
  let holders = new Map<string, PlayerLite>();
  for (const [id, { player, rows }] of byPlayer) {
    if ((careerGoals.get(id) ?? 0) < DIGIUNO_MIN_GOL_CARRIERA) continue;
    const asc = [...rows].sort((a, b) => a.index - b.index);
    const streak = longestStreak(asc, (r) => r.gol === 0);
    if (streak > best) {
      best = streak;
      holders = new Map([[id, player]]);
    } else if (streak === best && streak > 0) {
      holders.set(id, player);
    }
  }

  if (best === 0) return null;
  return { value: best, holders: Array.from(holders.values()), minGolCarriera: DIGIUNO_MIN_GOL_CARRIERA };
}

/** Pausa più lunga (in partite del gruppo, non tempo solare) tra due presenze
 *  consecutive dello stesso giocatore. Serve almeno 2 presenze per avere un gap. */
export function computeFantasmaRecord(
  participants: { match_id: string; players: PlayerLite }[],
  matchIndexById: Map<string, number>
): PlayerHolderRecord | null {
  const byPlayer = new Map<string, { player: PlayerLite; indices: number[] }>();
  for (const row of participants) {
    const entry = byPlayer.get(row.players.id) ?? { player: row.players, indices: [] };
    entry.indices.push(matchIndexById.get(row.match_id) ?? -1);
    byPlayer.set(row.players.id, entry);
  }

  let best = 0;
  let holders = new Map<string, PlayerLite>();
  for (const { player, indices } of byPlayer.values()) {
    if (indices.length < 2) continue;
    const sorted = [...indices].sort((a, b) => a - b);
    let maxGap = 0;
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i] - sorted[i - 1] - 1;
      if (gap > maxGap) maxGap = gap;
    }
    if (maxGap > best) {
      best = maxGap;
      holders = new Map([[player.id, player]]);
    } else if (maxGap === best && maxGap > 0) {
      holders.set(player.id, player);
    }
  }

  if (best === 0) return null;
  return { value: best, holders: Array.from(holders.values()) };
}

// --- Portiere ------------------------------------------------------------------

interface GoalkeeperParticipantRow {
  match_id: string;
  squadra: Squadra;
  portiere: boolean;
  players: PlayerLite;
}

export function computeMostUsedGoalkeeper(
  participants: GoalkeeperParticipantRow[]
): PlayerHolderRecord | null {
  const counts = new Map<string, { player: PlayerLite; count: number }>();
  for (const row of participants) {
    if (!row.portiere) continue;
    const entry = counts.get(row.players.id) ?? { player: row.players, count: 0 };
    entry.count += 1;
    counts.set(row.players.id, entry);
  }
  if (counts.size === 0) return null;
  const max = Math.max(...Array.from(counts.values()).map((e) => e.count));
  if (max <= 0) return null;
  return {
    value: max,
    holders: Array.from(counts.values())
      .filter((e) => e.count === max)
      .map((e) => e.player),
  };
}

const MURO_MIN_PARTITE_PORTIERE = 2;

/** Media gol subiti più bassa tra i giocatori con almeno MURO_MIN_PARTITE_PORTIERE
 *  partite giocate in porta: qui "meglio" è il valore più basso, non il più alto. */
export function computeMuroInvalicabile(
  participants: GoalkeeperParticipantRow[],
  resultsById: Map<string, { gol_bianca: number; gol_nera: number }>
): (PlayerHolderRecord & { minPartite: number }) | null {
  const byPlayer = new Map<string, { player: PlayerLite; golSubiti: number; partite: number }>();
  for (const row of participants) {
    if (!row.portiere) continue;
    const r = resultsById.get(row.match_id);
    if (!r) continue;
    const subiti = row.squadra === "bianca" ? r.gol_nera : r.gol_bianca;
    const entry = byPlayer.get(row.players.id) ?? { player: row.players, golSubiti: 0, partite: 0 };
    entry.golSubiti += subiti;
    entry.partite += 1;
    byPlayer.set(row.players.id, entry);
  }

  let best = Infinity;
  let holders = new Map<string, PlayerLite>();
  for (const { player, golSubiti, partite } of byPlayer.values()) {
    if (partite < MURO_MIN_PARTITE_PORTIERE) continue;
    const media = round2(golSubiti / partite);
    if (media < best) {
      best = media;
      holders = new Map([[player.id, player]]);
    } else if (media === best) {
      holders.set(player.id, player);
    }
  }

  if (!isFinite(best)) return null;
  return { value: best, holders: Array.from(holders.values()), minPartite: MURO_MIN_PARTITE_PORTIERE };
}

export function computeAttendanceStreakRecord(
  matchOrder: string[],
  participants: { match_id: string; players: PlayerLite }[]
): PlayerHolderRecord | null {
  const byPlayer = new Map<string, { player: PlayerLite; set: Set<string> }>();
  for (const row of participants) {
    const entry = byPlayer.get(row.players.id) ?? { player: row.players, set: new Set<string>() };
    entry.set.add(row.match_id);
    byPlayer.set(row.players.id, entry);
  }

  let best = 0;
  let holders = new Map<string, PlayerLite>();
  for (const { player, set } of byPlayer.values()) {
    const streak = longestStreak(matchOrder, (id) => set.has(id));
    if (streak > best) {
      best = streak;
      holders = new Map([[player.id, player]]);
    } else if (streak === best && streak > 0) {
      holders.set(player.id, player);
    }
  }

  if (best === 0) return null;
  return { value: best, holders: Array.from(holders.values()) };
}

export function computeDecano(participants: { match_id: string; players: PlayerLite }[]): PlayerHolderRecord | null {
  const counts = new Map<string, { player: PlayerLite; count: number }>();
  for (const row of participants) {
    const entry = counts.get(row.players.id) ?? { player: row.players, count: 0 };
    entry.count += 1;
    counts.set(row.players.id, entry);
  }
  if (counts.size === 0) return null;
  const max = Math.max(...Array.from(counts.values()).map((e) => e.count));
  if (max <= 0) return null;
  return {
    value: max,
    holders: Array.from(counts.values())
      .filter((e) => e.count === max)
      .map((e) => e.player),
  };
}

const FEDELE_MIN_PRESENZE = 5;

// Normalizza sulle partite disputate dal gruppo *da quando il giocatore ha
// debuttato* (non sul totale storico): altrimenti "il più fedele" coincide
// sempre con "il Decano" (stesso denominatore per tutti = stesso ordinamento).
export function computeFedele(
  matchOrder: string[],
  participants: { match_id: string; players: PlayerLite }[]
): (PlayerHolderRecord & { minPresenze: number }) | null {
  const matchIndex = new Map(matchOrder.map((id, i) => [id, i]));
  const byPlayer = new Map<string, { player: PlayerLite; set: Set<string> }>();
  for (const row of participants) {
    const entry = byPlayer.get(row.players.id) ?? { player: row.players, set: new Set<string>() };
    entry.set.add(row.match_id);
    byPlayer.set(row.players.id, entry);
  }

  let best = -1;
  let holders = new Map<string, PlayerLite>();
  for (const { player, set } of byPlayer.values()) {
    const presenze = set.size;
    if (presenze < FEDELE_MIN_PRESENZE) continue;
    const debutIndex = Math.min(...Array.from(set).map((id) => matchIndex.get(id) ?? 0));
    const eligibleMatches = matchOrder.length - debutIndex;
    const pct = eligibleMatches > 0 ? Math.round((presenze / eligibleMatches) * 1000) / 10 : 0;
    if (pct > best) {
      best = pct;
      holders = new Map([[player.id, player]]);
    } else if (pct === best) {
      holders.set(player.id, player);
    }
  }

  if (best < 0) return null;
  return { value: best, holders: Array.from(holders.values()), minPresenze: FEDELE_MIN_PRESENZE };
}

// --- Record di squadra/partita -------------------------------------------------

export function computeBiggestTotalGoalsMatch(results: MatchResult[]): MatchRecord | null {
  if (results.length === 0) return null;
  const max = Math.max(...results.map((r) => r.gol_bianca + r.gol_nera));
  const matches = results
    .filter((r) => r.gol_bianca + r.gol_nera === max)
    .map((r) => ({ matchId: r.match_id, data: r.data, golBianca: r.gol_bianca, golNera: r.gol_nera }));
  return { value: max, matches };
}

export function computeBiggestBlowout(results: MatchResult[]): MatchRecord | null {
  if (results.length === 0) return null;
  const max = Math.max(...results.map((r) => Math.abs(r.gol_bianca - r.gol_nera)));
  if (max <= 0) return null;
  const matches = results
    .filter((r) => Math.abs(r.gol_bianca - r.gol_nera) === max)
    .map((r) => ({ matchId: r.match_id, data: r.data, golBianca: r.gol_bianca, golNera: r.gol_nera }));
  return { value: max, matches };
}

export function computeSmallestTotalGoalsMatch(results: MatchResult[]): MatchRecord | null {
  if (results.length === 0) return null;
  const min = Math.min(...results.map((r) => r.gol_bianca + r.gol_nera));
  const matches = results
    .filter((r) => r.gol_bianca + r.gol_nera === min)
    .map((r) => ({ matchId: r.match_id, data: r.data, golBianca: r.gol_bianca, golNera: r.gol_nera }));
  return { value: min, matches };
}

// A differenza di computeBiggestBlowout, uno scarto di 0 (pareggio perfetto) è
// il caso migliore possibile per "partita più equilibrata", non va escluso.
export function computeMostBalancedMatch(results: MatchResult[]): MatchRecord | null {
  if (results.length === 0) return null;
  const min = Math.min(...results.map((r) => Math.abs(r.gol_bianca - r.gol_nera)));
  const matches = results
    .filter((r) => Math.abs(r.gol_bianca - r.gol_nera) === min)
    .map((r) => ({ matchId: r.match_id, data: r.data, golBianca: r.gol_bianca, golNera: r.gol_nera }));
  return { value: min, matches };
}

export interface TeamScoreEntry {
  matchId: string;
  data: string;
  squadra: Squadra;
  golBianca: number;
  golNera: number;
  holders: PlayerLite[];
}

export interface TeamScoreRecord {
  value: number;
  entries: TeamScoreEntry[];
}

/** Miglior prestazione offensiva di una singola squadra in una partita, a
 *  prescindere da quanto ha subito (indipendente da computeBiggestTotalGoalsMatch,
 *  che guarda invece alla somma dei due punteggi). */
export function computeBestTeamScore(
  results: MatchResult[],
  participants: ParticipantRow[]
): TeamScoreRecord | null {
  if (results.length === 0) return null;
  const max = Math.max(...results.flatMap((r) => [r.gol_bianca, r.gol_nera]));
  if (max <= 0) return null;

  const byMatchSquadra = new Map<string, PlayerLite[]>();
  for (const row of participants) {
    const key = `${row.match_id}|${row.squadra}`;
    const arr = byMatchSquadra.get(key) ?? [];
    arr.push(row.players);
    byMatchSquadra.set(key, arr);
  }

  const entries: TeamScoreEntry[] = [];
  for (const r of results) {
    const squadre: Squadra[] = [];
    if (r.gol_bianca === max) squadre.push("bianca");
    if (r.gol_nera === max) squadre.push("nera");
    for (const squadra of squadre) {
      entries.push({
        matchId: r.match_id,
        data: r.data,
        squadra,
        golBianca: r.gol_bianca,
        golNera: r.gol_nera,
        holders: byMatchSquadra.get(`${r.match_id}|${squadra}`) ?? [],
      });
    }
  }

  return { value: max, entries };
}

export const GOLEADA_THRESHOLD = 5;

export function goleadaWinnerByMatch(
  results: { match_id: string; gol_bianca: number; gol_nera: number }[]
): Map<string, Squadra> {
  const map = new Map<string, Squadra>();
  for (const r of results) {
    const diff = Math.abs(r.gol_bianca - r.gol_nera);
    if (diff >= GOLEADA_THRESHOLD) map.set(r.match_id, r.gol_bianca > r.gol_nera ? "bianca" : "nera");
  }
  return map;
}

export function computeGoleadaLeaders(
  participants: ParticipantRow[],
  winnerByMatch: Map<string, Squadra>
): { winners: PlayerHolderRecord | null; losers: PlayerHolderRecord | null } {
  const winCounts = new Map<string, { player: PlayerLite; count: number }>();
  const loseCounts = new Map<string, { player: PlayerLite; count: number }>();

  for (const row of participants) {
    const winningSquadra = winnerByMatch.get(row.match_id);
    if (!winningSquadra) continue;
    const map = row.squadra === winningSquadra ? winCounts : loseCounts;
    const entry = map.get(row.players.id) ?? { player: row.players, count: 0 };
    entry.count += 1;
    map.set(row.players.id, entry);
  }

  function topOf(map: Map<string, { player: PlayerLite; count: number }>): PlayerHolderRecord | null {
    if (map.size === 0) return null;
    const max = Math.max(...Array.from(map.values()).map((e) => e.count));
    if (max <= 0) return null;
    return {
      value: max,
      holders: Array.from(map.values())
        .filter((e) => e.count === max)
        .map((e) => e.player),
    };
  }

  return { winners: topOf(winCounts), losers: topOf(loseCounts) };
}

// --- Curiosità -----------------------------------------------------------------

export interface MonthGoalsRecord {
  value: number;
  months: { monthKey: string; label: string }[];
}

export function computeBestGoalMonth(results: MatchResult[]): MonthGoalsRecord | null {
  const byMonth = new Map<string, number>();
  for (const r of results) {
    const key = r.data.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + r.gol_bianca + r.gol_nera);
  }
  if (byMonth.size === 0) return null;
  const max = Math.max(...Array.from(byMonth.values()));
  if (max <= 0) return null;
  const months = Array.from(byMonth.entries())
    .filter(([, value]) => value === max)
    .map(([monthKey]) => ({ monthKey, label: monthLabel(monthKey) }));
  return { value: max, months };
}

function pairKey(aId: string, bId: string): string {
  return aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`;
}

export function computeMostFrequentPair(participants: ParticipantRow[]): PairRecord | null {
  const byMatchSquadra = new Map<string, PlayerLite[]>();
  for (const row of participants) {
    const key = `${row.match_id}|${row.squadra}`;
    const arr = byMatchSquadra.get(key) ?? [];
    arr.push(row.players);
    byMatchSquadra.set(key, arr);
  }

  const counts = new Map<string, { a: PlayerLite; b: PlayerLite; count: number }>();
  for (const group of byMatchSquadra.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const key = pairKey(group[i].id, group[j].id);
        const entry = counts.get(key) ?? { a: group[i], b: group[j], count: 0 };
        entry.count += 1;
        counts.set(key, entry);
      }
    }
  }

  return topPair(counts);
}

export function computeMostFrequentOpponents(participants: ParticipantRow[]): PairRecord | null {
  const byMatch = new Map<string, { bianca: PlayerLite[]; nera: PlayerLite[] }>();
  for (const row of participants) {
    const entry = byMatch.get(row.match_id) ?? { bianca: [], nera: [] };
    entry[row.squadra].push(row.players);
    byMatch.set(row.match_id, entry);
  }

  const counts = new Map<string, { a: PlayerLite; b: PlayerLite; count: number }>();
  for (const { bianca, nera } of byMatch.values()) {
    for (const a of bianca) {
      for (const b of nera) {
        const key = pairKey(a.id, b.id);
        const entry = counts.get(key) ?? { a, b, count: 0 };
        entry.count += 1;
        counts.set(key, entry);
      }
    }
  }

  return topPair(counts);
}

function topPair(counts: Map<string, { a: PlayerLite; b: PlayerLite; count: number }>): PairRecord | null {
  if (counts.size === 0) return null;
  const max = Math.max(...Array.from(counts.values()).map((e) => e.count));
  if (max <= 0) return null;
  return {
    value: max,
    pairs: Array.from(counts.values())
      .filter((e) => e.count === max)
      .map((e) => ({ a: e.a, b: e.b })),
  };
}
