import { createClient } from "@/lib/supabase/server";
import { computeMarketValues } from "@/lib/data/market";
import { getAllParticipantsWithPlayers } from "@/lib/data/stats";
import type { Ruolo } from "@/lib/types";

// Sotto questa soglia il giocatore ha giocato troppo poco perché il suo
// valore di mercato sia un confronto significativo per il gioco.
const MIN_PRESENZE = 5;

export interface GuessGamePlayer {
  id: string;
  nome: string;
  cognome: string;
  foto_url: string | null;
  ruolo: Ruolo | null;
  valore: number;
}

/** Pool di giocatori idonei al gioco: stessa formula di /mercato, filtrata a chi ha almeno MIN_PRESENZE presenze. */
export async function getGuessGamePool(): Promise<GuessGamePlayer[]> {
  const [values, participants] = await Promise.all([
    computeMarketValues(),
    getAllParticipantsWithPlayers(),
  ]);

  const presenzeByPlayer = new Map<string, number>();
  for (const row of participants) {
    presenzeByPlayer.set(row.players.id, (presenzeByPlayer.get(row.players.id) ?? 0) + 1);
  }

  return values
    .filter((v) => (presenzeByPlayer.get(v.player.id) ?? 0) >= MIN_PRESENZE)
    .map((v) => ({
      id: v.player.id,
      nome: v.player.nome,
      cognome: v.player.cognome,
      foto_url: v.player.foto_url,
      ruolo: v.player.ruolo,
      valore: v.valore,
    }));
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
