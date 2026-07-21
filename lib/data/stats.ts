import { createClient } from "@/lib/supabase/server";
import { seasonOf, seasonsFromDates } from "@/lib/season";
import type { MvpStanding, Player, PlayerCareerStats } from "@/lib/types";

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

export async function getMvpStandings(): Promise<MvpStanding[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mvp_standings")
    .select("*")
    .order("mvp_count", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
