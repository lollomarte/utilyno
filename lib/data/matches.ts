import { createClient } from "@/lib/supabase/server";
import type { Match, MatchResult, Player, Squadra } from "@/lib/types";

export interface ParticipantWithPlayer {
  id: string;
  squadra: Squadra;
  gol: number;
  player: Pick<Player, "id" | "nome" | "cognome" | "foto_url" | "attivo">;
}

export interface MatchFull {
  match: Match;
  result: Pick<MatchResult, "gol_bianca" | "gol_nera" | "num_partecipanti">;
  mvp: Pick<Player, "id" | "nome" | "cognome" | "foto_url"> | null;
  participants: ParticipantWithPlayer[];
}

export async function getAllMatchResults(): Promise<MatchResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_results")
    .select("*")
    .order("data", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getLatestMatchResult(): Promise<MatchResult | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_results")
    .select("*")
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getMatchFull(matchId: string): Promise<MatchFull | null> {
  const supabase = await createClient();

  const [{ data: match, error: matchError }, { data: participants, error: partError }] =
    await Promise.all([
      supabase
        .from("matches")
        .select("*, mvp:players!mvp_player_id(id, nome, cognome, foto_url)")
        .eq("id", matchId)
        .maybeSingle(),
      supabase
        .from("match_participants")
        .select("id, squadra, gol, player:players(id, nome, cognome, foto_url, attivo)")
        .eq("match_id", matchId),
    ]);

  if (matchError) throw matchError;
  if (partError) throw partError;
  if (!match) return null;

  const rows = (participants ?? []) as unknown as ParticipantWithPlayer[];
  const gol_bianca = rows.filter((p) => p.squadra === "bianca").reduce((s, p) => s + p.gol, 0);
  const gol_nera = rows.filter((p) => p.squadra === "nera").reduce((s, p) => s + p.gol, 0);

  const { mvp, ...matchFields } = match as Match & {
    mvp: MatchFull["mvp"];
  };

  return {
    match: matchFields,
    result: { gol_bianca, gol_nera, num_partecipanti: rows.length },
    mvp: mvp ?? null,
    participants: rows.sort((a, b) => b.gol - a.gol),
  };
}

export async function getLatestMatchFull(): Promise<MatchFull | null> {
  const latest = await getLatestMatchResult();
  if (!latest) return null;
  return getMatchFull(latest.match_id);
}

export function topScorersOf(participants: ParticipantWithPlayer[]): ParticipantWithPlayer[] {
  const max = Math.max(0, ...participants.map((p) => p.gol));
  if (max === 0) return [];
  return participants.filter((p) => p.gol === max);
}

export async function deleteMatch(matchId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw error;
}
