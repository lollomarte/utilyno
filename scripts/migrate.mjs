import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/migrate.mjs <path-sql>");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");

let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error("Manca POSTGRES_URL_NON_POOLING / POSTGRES_URL in .env.local");
  process.exit(1);
}

const url = new URL(connectionString);
url.searchParams.delete("sslmode");
connectionString = url.toString();

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log(`OK: eseguito ${file}`);
} catch (err) {
  console.error("Errore durante la migrazione:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
