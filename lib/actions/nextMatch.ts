"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireAdmin } from "@/lib/supabase/server";

export async function updateNextMatchInfoAction(_prevState: unknown, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const data = String(formData.get("data") ?? "") || null;
  const orario = String(formData.get("orario") ?? "") || null;
  const campo = String(formData.get("campo") ?? "").trim() || null;

  const { error } = await supabase
    .from("next_match_info")
    .update({ data, orario, campo, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/");
  redirect("/admin/prossima-partita?toast=next-match-saved");
}
