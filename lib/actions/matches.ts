"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireAdmin } from "@/lib/supabase/server";

interface ParticipantInput {
  player_id: string;
  squadra: "bianca" | "nera";
  gol: number;
}

function parseParticipants(raw: string): ParticipantInput[] {
  let parsed: ParticipantInput[];
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return parsed
    .filter((p) => p.player_id)
    .map((p) => ({ player_id: p.player_id, squadra: p.squadra, gol: Number(p.gol) || 0 }));
}

function validateParticipants(participants: ParticipantInput[]): string | null {
  if (participants.length === 0) return "Aggiungi almeno un giocatore.";
  const ids = new Set(participants.map((p) => p.player_id));
  if (ids.size !== participants.length) return "Lo stesso giocatore è stato aggiunto più volte.";
  return null;
}

export async function createMatchAction(_prevState: unknown, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const data = String(formData.get("data") ?? "");
  const note = String(formData.get("note") ?? "");
  const mvp_player_id = String(formData.get("mvp_player_id") ?? "") || null;
  const participants = parseParticipants(String(formData.get("participants") ?? "[]"));

  if (!data) return { error: "La data è obbligatoria." };
  const validationError = validateParticipants(participants);
  if (validationError) return { error: validationError };

  const { error } = await supabase.rpc("create_match", {
    p_data: data,
    p_note: note,
    p_mvp_player_id: mvp_player_id,
    p_participants: participants,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/risultati");
  revalidatePath("/classifiche");
  redirect("/admin/partite?toast=match-saved");
}

export async function updateMatchAction(_prevState: unknown, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const data = String(formData.get("data") ?? "");
  const note = String(formData.get("note") ?? "");
  const mvp_player_id = String(formData.get("mvp_player_id") ?? "") || null;
  const participants = parseParticipants(String(formData.get("participants") ?? "[]"));

  if (!id) return { error: "Partita non valida." };
  if (!data) return { error: "La data è obbligatoria." };
  const validationError = validateParticipants(participants);
  if (validationError) return { error: validationError };

  const { error } = await supabase.rpc("update_match", {
    p_match_id: id,
    p_data: data,
    p_note: note,
    p_mvp_player_id: mvp_player_id,
    p_participants: participants,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/risultati");
  revalidatePath(`/risultati/${id}`);
  revalidatePath("/classifiche");
  redirect("/admin/partite?toast=match-saved");
}

export async function deleteMatchAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("matches").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/risultati");
  revalidatePath("/classifiche");
  redirect("/admin/partite?toast=match-deleted");
}
