"use server";

import { createClient } from "@/lib/supabase/server";

const MAX_NICKNAME_LENGTH = 24;

export async function submitGuessGameScore(
  nickname: string,
  punteggio: number
): Promise<{ error?: string }> {
  const trimmed = nickname.trim().slice(0, MAX_NICKNAME_LENGTH);
  if (!trimmed) return { error: "Inserisci un nickname." };
  if (!Number.isInteger(punteggio) || punteggio < 0) return { error: "Punteggio non valido." };

  const supabase = await createClient();
  const { error } = await supabase.from("guess_game_scores").insert({ nickname: trimmed, punteggio });
  if (error) return { error: error.message };
  return {};
}
