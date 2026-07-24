import { createClient } from "@/lib/supabase/server";

export interface NextMatchInfo {
  data: string | null;
  orario: string | null;
  campo: string | null;
  updated_at: string;
}

export async function getNextMatchInfo(): Promise<NextMatchInfo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("next_match_info")
    .select("data, orario, campo, updated_at")
    .eq("id", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
