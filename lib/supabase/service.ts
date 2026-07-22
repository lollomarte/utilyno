import { createClient } from "@supabase/supabase-js";

// Client con service role key: bypassa la RLS. Da usare ESCLUSIVAMENTE in
// codice server-only per job di sistema (es. snapshot di mercato) — non deve
// mai essere importato, direttamente o transitivamente, da un componente o
// modulo "use client", altrimenti la service role key finirebbe nel bundle.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
