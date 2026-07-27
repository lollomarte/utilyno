import { createClient } from "@/lib/supabase/server";
import { computeMarketValues } from "@/lib/data/market";
import type { PlayerCareerStats, Ruolo } from "@/lib/types";

// Sotto questa soglia il giocatore ha giocato troppo poco perché le sue
// statistiche siano un confronto significativo per il gioco.
const MIN_PRESENZE = 5;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export interface GuessGamePlayer {
  id: string;
  nome: string;
  cognome: string;
  foto_url: string | null;
  ruolo: Ruolo | null;
  valore: number;
  presenze: number;
  golTotali: number;
  mediaGol: number;
  percentualeVittorie: number;
}

/**
 * Pool di giocatori idonei al gioco, filtrata a chi ha almeno MIN_PRESENZE
 * presenze. Legge le statistiche già calcolate altrove nel sito (quotazioni
 * di /mercato + la vista player_career_stats usata da classifiche/profilo),
 * nessun nuovo calcolo dedicato al gioco.
 */
export async function getGuessGamePool(): Promise<GuessGamePlayer[]> {
  const supabase = await createClient();
  const [values, { data: careerRows, error }] = await Promise.all([
    computeMarketValues(),
    supabase.from("player_career_stats").select("*"),
  ]);
  if (error) throw error;

  const careerByPlayer = new Map((careerRows as PlayerCareerStats[] | null ?? []).map((r) => [r.player_id, r]));

  return values
    .filter((v) => (careerByPlayer.get(v.player.id)?.presenze ?? 0) >= MIN_PRESENZE)
    .map((v) => {
      const career = careerByPlayer.get(v.player.id)!;
      return {
        id: v.player.id,
        nome: v.player.nome,
        cognome: v.player.cognome,
        foto_url: v.player.foto_url,
        ruolo: v.player.ruolo,
        valore: v.valore,
        presenze: career.presenze,
        golTotali: career.gol_totali,
        mediaGol: career.media_gol,
        percentualeVittorie: career.presenze > 0 ? round1((career.vittorie / career.presenze) * 100) : 0,
      };
    });
}

export interface GuessGameLeaderboardRow {
  nickname: string;
  punteggio: number;
  data: string;
}

/** Record personale più alto per nickname, calcolato dallo storico di tutte le partite giocate. */
export async function getGuessGameLeaderboard(): Promise<GuessGameLeaderboardRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guess_game_scores")
    .select("nickname, punteggio, created_at")
    .order("punteggio", { ascending: false });
  if (error) throw error;

  const bestByNickname = new Map<string, GuessGameLeaderboardRow>();
  for (const row of data ?? []) {
    const key = row.nickname.trim().toLowerCase();
    const existing = bestByNickname.get(key);
    if (!existing || row.punteggio > existing.punteggio) {
      bestByNickname.set(key, { nickname: row.nickname.trim(), punteggio: row.punteggio, data: row.created_at });
    }
  }

  return Array.from(bestByNickname.values()).sort((a, b) => b.punteggio - a.punteggio);
}
