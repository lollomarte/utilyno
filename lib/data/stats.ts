import { createClient } from "@/lib/supabase/server";
import { seasonOf, seasonsFromDates } from "@/lib/season";
import type { MvpStanding, Player, PlayerCareerStats, Squadra } from "@/lib/types";

export async function getScorersStanding(): Promise<PlayerCareerStats[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_career_stats")
    .select("*")
    .order("gol_totali", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSeasonsList(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("matches").select("data");
  if (error) throw error;
  return seasonsFromDates((data ?? []).map((m) => m.data));
}

export interface AttendanceRow {
  player: Player;
  presenze: number;
  percentuale: number;
}

export async function getAttendanceStanding(
  season?: string
): Promise<{ totalMatches: number; standing: AttendanceRow[] }> {
  const supabase = await createClient();

  const { data: matches, error: matchError } = await supabase.from("matches").select("id, data");
  if (matchError) throw matchError;

  const filteredMatchIds = new Set(
    (matches ?? []).filter((m) => !season || seasonOf(m.data) === season).map((m) => m.id)
  );
  const totalMatches = filteredMatchIds.size;

  const { data: participants, error: partError } = await supabase
    .from("match_participants")
    .select("match_id, players(id, nome, cognome, foto_url, attivo, data_nascita, created_at)");
  if (partError) throw partError;

  const counts = new Map<string, { player: Player; presenze: number }>();
  for (const row of (participants ?? []) as unknown as {
    match_id: string;
    players: Player;
  }[]) {
    if (!filteredMatchIds.has(row.match_id)) continue;
    const entry = counts.get(row.players.id) ?? { player: row.players, presenze: 0 };
    entry.presenze += 1;
    counts.set(row.players.id, entry);
  }

  const standing = Array.from(counts.values())
    .map(({ player, presenze }) => ({
      player,
      presenze,
      percentuale: totalMatches > 0 ? Math.round((presenze / totalMatches) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.presenze - a.presenze);

  return { totalMatches, standing };
}

async function getMatchesAsc() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("id, data")
    .order("data", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function getAllParticipantsWithPlayers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_participants")
    .select(
      "match_id, gol, squadra, players(id, nome, cognome, foto_url, attivo, data_nascita, created_at)"
    );
  if (error) throw error;
  return (data ?? []) as unknown as {
    match_id: string;
    gol: number;
    squadra: Squadra;
    players: Player;
  }[];
}

async function getMatchResultsById(): Promise<Map<string, { gol_bianca: number; gol_nera: number }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("match_results").select("match_id, gol_bianca, gol_nera");
  if (error) throw error;
  const map = new Map<string, { gol_bianca: number; gol_nera: number }>();
  for (const r of data ?? []) map.set(r.match_id, { gol_bianca: r.gol_bianca, gol_nera: r.gol_nera });
  return map;
}

function participantWon(
  row: { match_id: string; squadra: Squadra },
  resultsById: Map<string, { gol_bianca: number; gol_nera: number }>
): boolean {
  const r = resultsById.get(row.match_id);
  if (!r || r.gol_bianca === r.gol_nera) return false;
  return (
    (row.squadra === "bianca" && r.gol_bianca > r.gol_nera) ||
    (row.squadra === "nera" && r.gol_nera > r.gol_bianca)
  );
}

function rankMap(entries: { id: string; value: number }[]): Map<string, number> {
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const map = new Map<string, number>();
  sorted.forEach((e, i) => map.set(e.id, i + 1));
  return map;
}

export interface WithRankDelta {
  rankDelta: number | null;
  isNew: boolean;
}

export async function getScorersStandingWithDelta(): Promise<(PlayerCareerStats & WithRankDelta)[]> {
  const [current, matches, participants] = await Promise.all([
    getScorersStanding(),
    getMatchesAsc(),
    getAllParticipantsWithPlayers(),
  ]);

  if (matches.length < 2) {
    return current.map((c) => ({ ...c, rankDelta: null, isNew: false }));
  }

  const lastDate = matches[matches.length - 1].data;
  const priorMatchIds = new Set(matches.filter((m) => m.data !== lastDate).map((m) => m.id));

  const priorGoals = new Map<string, number>();
  for (const row of participants) {
    if (!priorMatchIds.has(row.match_id)) continue;
    priorGoals.set(row.players.id, (priorGoals.get(row.players.id) ?? 0) + row.gol);
  }

  const priorRanks = rankMap(Array.from(priorGoals.entries()).map(([id, value]) => ({ id, value })));
  const currentRanks = rankMap(current.map((c) => ({ id: c.player_id, value: c.gol_totali })));

  return current.map((c) => {
    const currentRank = currentRanks.get(c.player_id)!;
    const priorRank = priorRanks.get(c.player_id);
    if (priorRank === undefined) return { ...c, rankDelta: null, isNew: true };
    return { ...c, rankDelta: priorRank - currentRank, isNew: false };
  });
}

export async function getAttendanceStandingWithDelta(): Promise<(AttendanceRow & WithRankDelta)[]> {
  const [{ standing: current }, matches, participants] = await Promise.all([
    getAttendanceStanding(),
    getMatchesAsc(),
    getAllParticipantsWithPlayers(),
  ]);

  if (matches.length < 2) {
    return current.map((c) => ({ ...c, rankDelta: null, isNew: false }));
  }

  const lastDate = matches[matches.length - 1].data;
  const priorMatchIds = new Set(matches.filter((m) => m.data !== lastDate).map((m) => m.id));

  const priorPresence = new Map<string, number>();
  for (const row of participants) {
    if (!priorMatchIds.has(row.match_id)) continue;
    priorPresence.set(row.players.id, (priorPresence.get(row.players.id) ?? 0) + 1);
  }

  const priorRanks = rankMap(Array.from(priorPresence.entries()).map(([id, value]) => ({ id, value })));
  const currentRanks = rankMap(current.map((c) => ({ id: c.player.id, value: c.presenze })));

  return current.map((c) => {
    const currentRank = currentRanks.get(c.player.id)!;
    const priorRank = priorRanks.get(c.player.id);
    if (priorRank === undefined) return { ...c, rankDelta: null, isNew: true };
    return { ...c, rankDelta: priorRank - currentRank, isNew: false };
  });
}

export interface WinsRow {
  player_id: string;
  nome: string;
  cognome: string;
  foto_url: string | null;
  attivo: boolean;
  presenze: number;
  vittorie: number;
  media_vittorie: number;
}

export async function getWinsStanding(): Promise<WinsRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_career_stats")
    .select("player_id, nome, cognome, foto_url, attivo, presenze, vittorie")
    .order("vittorie", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    media_vittorie: r.presenze > 0 ? Math.round((r.vittorie / r.presenze) * 100) / 100 : 0,
  }));
}

export async function getWinsStandingWithDelta(): Promise<(WinsRow & WithRankDelta)[]> {
  const [current, matches, participants, resultsById] = await Promise.all([
    getWinsStanding(),
    getMatchesAsc(),
    getAllParticipantsWithPlayers(),
    getMatchResultsById(),
  ]);

  if (matches.length < 2) {
    return current.map((c) => ({ ...c, rankDelta: null, isNew: false }));
  }

  const lastDate = matches[matches.length - 1].data;
  const priorMatchIds = new Set(matches.filter((m) => m.data !== lastDate).map((m) => m.id));

  const priorWins = new Map<string, number>();
  for (const row of participants) {
    if (!priorMatchIds.has(row.match_id) || !participantWon(row, resultsById)) continue;
    priorWins.set(row.players.id, (priorWins.get(row.players.id) ?? 0) + 1);
  }

  const priorRanks = rankMap(Array.from(priorWins.entries()).map(([id, value]) => ({ id, value })));
  const currentRanks = rankMap(current.map((c) => ({ id: c.player_id, value: c.vittorie })));

  return current.map((c) => {
    const currentRank = currentRanks.get(c.player_id)!;
    const priorRank = priorRanks.get(c.player_id);
    if (priorRank === undefined) return { ...c, rankDelta: null, isNew: true };
    return { ...c, rankDelta: priorRank - currentRank, isNew: false };
  });
}

export async function getMvpStandings(): Promise<MvpStanding[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mvp_standings")
    .select("*")
    .order("mvp_count", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
