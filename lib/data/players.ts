import { createClient } from "@/lib/supabase/server";
import type { Player, PlayerCareerStats, PlayerMatchResult } from "@/lib/types";

export async function getAllPlayers(opts?: {
  search?: string;
  activeOnly?: boolean;
}): Promise<Player[]> {
  const supabase = await createClient();
  let query = supabase.from("players").select("*").order("cognome").order("nome");

  if (opts?.activeOnly) {
    query = query.eq("attivo", true);
  }
  if (opts?.search) {
    const term = opts.search.trim();
    if (term) {
      query = query.or(`nome.ilike.%${term}%,cognome.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPlayer(id: string): Promise<Player | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("players").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPlayerCareerStats(id: string): Promise<PlayerCareerStats | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_career_stats")
    .select("*")
    .eq("player_id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPlayerMatchHistory(
  id: string,
  limit?: number
): Promise<PlayerMatchResult[]> {
  const supabase = await createClient();
  let query = supabase
    .from("player_match_results")
    .select("*")
    .eq("player_id", id)
    .order("data", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function deletePlayer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw error;
}

export async function setPlayerActive(id: string, attivo: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("players").update({ attivo }).eq("id", id);
  if (error) throw error;
}
