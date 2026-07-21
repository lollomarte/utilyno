"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireAdmin } from "@/lib/supabase/server";

export async function savePlayer(_prevState: unknown, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "") || null;
  const nome = String(formData.get("nome") ?? "").trim();
  const cognome = String(formData.get("cognome") ?? "").trim();
  const data_nascita = String(formData.get("data_nascita") ?? "") || null;
  const attivo = formData.get("attivo") === "on";
  const photo = formData.get("foto") as File | null;

  if (!nome || !cognome) {
    return { error: "Nome e cognome sono obbligatori." };
  }

  let foto_url = String(formData.get("foto_url_existing") ?? "") || null;

  if (photo && photo.size > 0) {
    const ext = photo.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("player-photos")
      .upload(path, photo, { upsert: false, contentType: photo.type });

    if (uploadError) {
      return { error: `Errore upload foto: ${uploadError.message}` };
    }

    const { data: pub } = supabase.storage.from("player-photos").getPublicUrl(path);
    foto_url = pub.publicUrl;
  }

  const payload = { nome, cognome, data_nascita, attivo, foto_url };

  const { error } = id
    ? await supabase.from("players").update(payload).eq("id", id)
    : await supabase.from("players").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/giocatori");
  revalidatePath("/classifiche");
  revalidatePath("/");
  redirect("/admin/giocatori");
}

export async function toggleActiveAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const attivo = formData.get("attivo") === "true";

  const { error } = await supabase.from("players").update({ attivo: !attivo }).eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/giocatori");
  revalidatePath("/classifiche");
}
