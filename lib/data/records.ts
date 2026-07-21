import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/lib/types";

export interface RecordGoliPartita {
  gol: number;
  data: string;
  player: Pick<Player, "id" | "nome" | "cognome" | "foto_url">;
}

export async function getRecordGoliPartita(): Promise<RecordGoliPartita | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_participants")
    .select("gol, players(id, nome, cognome, foto_url), matches(data)")
    .order("gol", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as {
    gol: number;
    players: Pick<Player, "id" | "nome" | "cognome" | "foto_url">;
    matches: { data: string };
  };

  return { gol: row.gol, data: row.matches.data, player: row.players };
}

export interface StrisciaRecord {
  player: Pick<Player, "id" | "nome" | "cognome" | "foto_url">;
  streak: number;
}

export async function getStrisciaPresenzeRecord(): Promise<StrisciaRecord | null> {
  const supabase = await createClient();
  const [{ data: matches, error: mErr }, { data: participants, error: pErr }] = await Promise.all([
    supabase.from("matches").select("id, data").order("data", { ascending: true }),
    supabase.from("match_participants").select("match_id, players(id, nome, cognome, foto_url)"),
  ]);
  if (mErr) throw mErr;
  if (pErr) throw pErr;

  const matchOrder = (matches ?? []).map((m) => m.id);

  const byPlayer = new Map<
    string,
    { player: Pick<Player, "id" | "nome" | "cognome" | "foto_url">; set: Set<string> }
  >();

  for (const row of (participants ?? []) as unknown as {
    match_id: string;
    players: Pick<Player, "id" | "nome" | "cognome" | "foto_url">;
  }[]) {
    const entry = byPlayer.get(row.players.id) ?? { player: row.players, set: new Set<string>() };
    entry.set.add(row.match_id);
    byPlayer.set(row.players.id, entry);
  }

  let best: StrisciaRecord | null = null;
  for (const { player, set } of byPlayer.values()) {
    let current = 0;
    let max = 0;
    for (const matchId of matchOrder) {
      if (set.has(matchId)) {
        current += 1;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    }
    if (max > 0 && (!best || max > best.streak)) {
      best = { player, streak: max };
    }
  }

  return best;
}
