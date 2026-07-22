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

export interface ParticipantWithPlayerId extends ParticipantWithPlayer {
  player_id: string;
}

export interface MatchResultWithParticipants extends MatchResult {
  participants: ParticipantWithPlayerId[];
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

export async function getAllMatchResultsWithParticipants(): Promise<MatchResultWithParticipants[]> {
  const supabase = await createClient();

  const [{ data: results, error: resultsError }, { data: participants, error: partError }] =
    await Promise.all([
      supabase.from("match_results").select("*").order("data", { ascending: false }),
      supabase
        .from("match_participants")
        .select("id, match_id, player_id, squadra, gol, player:players(id, nome, cognome, foto_url, attivo)"),
    ]);

  if (resultsError) throw resultsError;
  if (partError) throw partError;

  const byMatch = new Map<string, ParticipantWithPlayerId[]>();
  for (const row of (participants ?? []) as unknown as (ParticipantWithPlayerId & {
    match_id: string;
  })[]) {
    const arr = byMatch.get(row.match_id) ?? [];
    arr.push(row);
    byMatch.set(row.match_id, arr);
  }

  return (results ?? []).map((r) => ({
    ...r,
    participants: (byMatch.get(r.match_id) ?? []).sort((a, b) => b.gol - a.gol),
  }));
}

export async function getMediaGolPerPartita(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("match_results").select("gol_bianca, gol_nera");
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, r) => sum + r.gol_bianca + r.gol_nera, 0);
  return Math.round((total / rows.length) * 100) / 100;
}

export interface HeadToHead {
  together: number;
  against: number;
  totalMatches: number;
}

export async function getHeadToHead(playerAId: string, playerBId: string): Promise<HeadToHead> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_participants")
    .select("match_id, player_id, squadra")
    .in("player_id", [playerAId, playerBId]);
  if (error) throw error;

  const byMatch = new Map<string, { a?: Squadra; b?: Squadra }>();
  for (const row of data ?? []) {
    const entry = byMatch.get(row.match_id) ?? {};
    if (row.player_id === playerAId) entry.a = row.squadra;
    if (row.player_id === playerBId) entry.b = row.squadra;
    byMatch.set(row.match_id, entry);
  }

  let together = 0;
  let against = 0;
  for (const { a, b } of byMatch.values()) {
    if (!a || !b) continue;
    if (a === b) together += 1;
    else against += 1;
  }

  return { together, against, totalMatches: together + against };
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

export async function deleteMatch(matchId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw error;
}
