import { createClient } from "@/lib/supabase/server";
import { currentSeason, seasonOf } from "@/lib/season";
import type { Player, PlayerMatchResult } from "@/lib/types";

export interface PlayerBadges {
  hatTrick: boolean;
  everPresent: boolean;
  decano: boolean;
}

export async function getPlayerBadges(
  player: Player,
  fullHistory: PlayerMatchResult[]
): Promise<PlayerBadges> {
  const supabase = await createClient();

  const hatTrick = fullHistory.some((h) => h.gol >= 3);

  const season = currentSeason();
  const [{ data: matches }, { data: oldest }] = await Promise.all([
    supabase.from("matches").select("id, data"),
    supabase
      .from("players")
      .select("id, data_nascita")
      .not("data_nascita", "is", null)
      .order("data_nascita", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const seasonMatchCount = (matches ?? []).filter((m) => seasonOf(m.data) === season).length;
  const seasonPresences = fullHistory.filter((h) => seasonOf(h.data) === season).length;
  const everPresent = seasonMatchCount > 0 && seasonPresences === seasonMatchCount;

  const decano = !!oldest && oldest.id === player.id;

  return { hatTrick, everPresent, decano };
}
