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

interface ManualResult {
  risultato_modificato_manualmente: boolean;
  gol_bianca_finale: number | null;
  gol_nera_finale: number | null;
}

function parseManualResult(formData: FormData): ManualResult | { error: string } {
  const manuale = String(formData.get("risultato_modificato_manualmente") ?? "false") === "true";
  if (!manuale) {
    return { risultato_modificato_manualmente: false, gol_bianca_finale: null, gol_nera_finale: null };
  }

  const biancaRaw = formData.get("gol_bianca_finale");
  const neraRaw = formData.get("gol_nera_finale");
  const bianca = Number(biancaRaw);
  const nera = Number(neraRaw);
  const valid =
    biancaRaw !== null &&
    neraRaw !== null &&
    biancaRaw !== "" &&
    neraRaw !== "" &&
    Number.isInteger(bianca) &&
    Number.isInteger(nera) &&
    bianca >= 0 &&
    nera >= 0;

  if (!valid) return { error: "Inserisci un risultato manuale valido (numeri interi non negativi)." };

  return { risultato_modificato_manualmente: true, gol_bianca_finale: bianca, gol_nera_finale: nera };
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
  const manualResult = parseManualResult(formData);
  if ("error" in manualResult) return { error: manualResult.error };

  const { error } = await supabase.rpc("create_match", {
    p_data: data,
    p_note: note,
    p_mvp_player_id: mvp_player_id,
    p_participants: participants,
    p_risultato_modificato_manualmente: manualResult.risultato_modificato_manualmente,
    p_gol_bianca_finale: manualResult.gol_bianca_finale,
    p_gol_nera_finale: manualResult.gol_nera_finale,
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
  const manualResult = parseManualResult(formData);
  if ("error" in manualResult) return { error: manualResult.error };

  const { error } = await supabase.rpc("update_match", {
    p_match_id: id,
    p_data: data,
    p_note: note,
    p_mvp_player_id: mvp_player_id,
    p_participants: participants,
    p_risultato_modificato_manualmente: manualResult.risultato_modificato_manualmente,
    p_gol_bianca_finale: manualResult.gol_bianca_finale,
    p_gol_nera_finale: manualResult.gol_nera_finale,
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
