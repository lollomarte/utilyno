import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

// Deve restare in sync con ADMIN_EMAIL_DOMAIN in lib/actions/auth.ts:
// il login usa uno username che viene mappato su questa email tecnica interna.
const ADMIN_EMAIL_DOMAIN = "admin.calciotto.local";

const username = process.argv[2];
if (!username) {
  console.error("Uso: node scripts/create-admin.mjs <username>");
  process.exit(1);
}

const email = `${username.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!url || !serviceKey) {
  console.error("Mancano NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const password = crypto.randomBytes(12).toString("base64url");

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Errore creazione utente:", error.message);
  process.exit(1);
}

console.log("Utente admin creato:");
console.log("  username:", username);
console.log("  password:", password);
console.log("  user id: ", data.user.id);
console.log("\nCambia la password dopo il primo accesso (dashboard Supabase > Authentication).");
