// Ricalcola gli snapshot in market_values con la formula del valore di mercato
// aggiornata (i pesi qui sotto devono restare in sync con lib/data/market.ts).
//
// Nota sui dati reali di questo progetto: al momento in cui questo script è
// stato scritto, market_values conteneva un solo mese (quello corrente) e sia
// le partite (matches.created_at) sia gli snapshot stessi risultavano inseriti
// nella stessa finestra di pochi giorni — cioè dati di setup/backfill iniziale,
// non un vero storico multi-mese già mostrato agli utenti. Per questo motivo lo
// script ricalcola ogni riga esistente usando lo STESSO storico partite pieno
// che userebbe oggi computeMarketValues() dal vivo (nessun tentativo di
// ricostruire un cutoff "come se fosse allora": con dati di backfill in corso
// quel cutoff non è ricostruibile in modo affidabile, e comunque non esiste
// ancora un trend reale da preservare). Il risultato è che il valore salvato
// per il mese coincide con quello che la pagina /mercato mostra dal vivo subito
// dopo l'esecuzione, cosa che garantisce un confronto "a partita" (trend) equo
// dal prossimo mese in poi. Se in futuro esistesse davvero uno storico
// multi-mese, questo script andrebbe rivisto per rispettare i cutoff mensili
// invece di applicare ovunque lo storico completo.
//
// Nessuna riga viene inserita o cancellata: solo UPDATE su righe già presenti.
//
// Uso:
//   node scripts/recalculate-market-values.mjs            (dry run, nessuna scrittura)
//   node scripts/recalculate-market-values.mjs --apply     (scrive su Supabase)

import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local"), quiet: true });

const APPLY = process.argv.includes("--apply");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Mancano NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- Stessa formula di lib/data/market.ts, SENZA il termine MVP -------------
const BASE_VALUE = 1.0;
const GOL_WEIGHT_BY_RUOLO = { attaccante: 0.3, centrocampista: 0.5, difensore: 0.8 };
const DEFAULT_GOL_WEIGHT = GOL_WEIGHT_BY_RUOLO.centrocampista;
const MEDIA_GOL_WEIGHT = 2;
const VITTORIE_WEIGHT = 0.2;
const MEDIA_VITTORIE_WEIGHT = 3;
const PRESENZE_WEIGHT = 0.3;
const PRESENZA_PCT_WEIGHT = 0.02;
const PRESENZA_PCT_BASELINE = 50;
const FORMA_MULTIPLIER = 1.2;
const RECENT_WINDOW = 5;
const MIN_VALUE = 0.1;

function round1(n) {
  return Math.round(n * 10) / 10;
}

async function main() {
  const [
    { data: matches, error: matchesError },
    { data: participants, error: participantsError },
    { data: results, error: resultsError },
    { data: players, error: playersError },
    { data: snapshots, error: snapshotsError },
  ] = await Promise.all([
    supabase.from("matches").select("id, data").order("data", { ascending: true }),
    supabase.from("match_participants").select("match_id, player_id, gol, squadra"),
    supabase.from("match_results").select("match_id, gol_bianca, gol_nera"),
    supabase.from("players").select("id, ruolo"),
    supabase.from("market_values").select("player_id, data_calcolo, valore"),
  ]);

  for (const [name, error] of [
    ["matches", matchesError],
    ["match_participants", participantsError],
    ["match_results", resultsError],
    ["players", playersError],
    ["market_values", snapshotsError],
  ]) {
    if (error) throw new Error(`Errore lettura ${name}: ${error.message}`);
  }

  if (snapshots.length === 0) {
    console.log("Nessuno snapshot in market_values: niente da ricalcolare.");
    return;
  }

  const totalMatches = matches.length;
  const matchIndexById = new Map(matches.map((m, i) => [m.id, i]));
  const resultsById = new Map(results.map((r) => [r.match_id, r]));
  const ruoloById = new Map(players.map((p) => [p.id, p.ruolo]));

  function participantWon(row) {
    const r = resultsById.get(row.match_id);
    if (!r || r.gol_bianca === r.gol_nera) return false;
    return (
      (row.squadra === "bianca" && r.gol_bianca > r.gol_nera) ||
      (row.squadra === "nera" && r.gol_nera > r.gol_bianca)
    );
  }

  const rowsByPlayer = new Map();
  for (const row of participants) {
    const index = matchIndexById.get(row.match_id) ?? -1;
    const arr = rowsByPlayer.get(row.player_id) ?? [];
    arr.push({ gol: row.gol, won: participantWon(row), index });
    rowsByPlayer.set(row.player_id, arr);
  }
  for (const arr of rowsByPlayer.values()) arr.sort((a, b) => a.index - b.index);

  function computeValore(playerId) {
    const rows = rowsByPlayer.get(playerId) ?? [];

    const presenze = rows.length;
    const golTotali = rows.reduce((s, r) => s + r.gol, 0);
    const vittorie = rows.filter((r) => r.won).length;
    const mediaGol = presenze > 0 ? golTotali / presenze : 0;
    const mediaVittorie = presenze > 0 ? vittorie / presenze : 0;
    const percentualePresenza = totalMatches > 0 ? presenze / totalMatches : 0;

    const recentRows = rows.slice(-RECENT_WINDOW);
    const recentCount = recentRows.length;
    const recentMediaGol = recentCount > 0 ? recentRows.reduce((s, r) => s + r.gol, 0) / recentCount : 0;
    const recentMediaVittorie =
      recentCount > 0 ? recentRows.filter((r) => r.won).length / recentCount : 0;

    const formaMultiplier =
      recentCount > 0 && recentMediaGol + recentMediaVittorie > mediaGol + mediaVittorie
        ? FORMA_MULTIPLIER
        : 1;

    const curvaPresenza = (percentualePresenza * 100 - PRESENZA_PCT_BASELINE) * PRESENZA_PCT_WEIGHT;
    const ruolo = ruoloById.get(playerId);
    const golWeight = ruolo ? GOL_WEIGHT_BY_RUOLO[ruolo] : DEFAULT_GOL_WEIGHT;

    const raw =
      BASE_VALUE +
      golTotali * golWeight +
      mediaGol * MEDIA_GOL_WEIGHT +
      vittorie * VITTORIE_WEIGHT +
      mediaVittorie * MEDIA_VITTORIE_WEIGHT +
      presenze * PRESENZE_WEIGHT +
      curvaPresenza;

    return Math.max(MIN_VALUE, round1(raw * formaMultiplier));
  }

  const dataCalcoloList = Array.from(new Set(snapshots.map((s) => s.data_calcolo))).sort();
  console.log(`${APPLY ? "APPLY" : "DRY RUN"} — ${snapshots.length} righe su ${dataCalcoloList.length} mesi\n`);

  const valoreByPlayer = new Map();

  let totalChanged = 0;
  const changes = [];

  for (const row of snapshots) {
    const nuovoValore = valoreByPlayer.get(row.player_id) ?? computeValore(row.player_id);
    valoreByPlayer.set(row.player_id, nuovoValore);
    const vecchioValore = Number(row.valore);

    if (vecchioValore !== nuovoValore) {
      totalChanged++;
      changes.push({ dataCalcolo: row.data_calcolo, playerId: row.player_id, vecchioValore, nuovoValore });
      if (APPLY) {
        const { error: updateError } = await supabase
          .from("market_values")
          .update({ valore: nuovoValore })
          .eq("player_id", row.player_id)
          .eq("data_calcolo", row.data_calcolo);
        if (updateError) {
          throw new Error(`Update ${row.player_id}/${row.data_calcolo}: ${updateError.message}`);
        }
      }
    }
  }

  for (const dataCalcolo of dataCalcoloList) {
    const total = snapshots.filter((s) => s.data_calcolo === dataCalcolo).length;
    const changed = changes.filter((c) => c.dataCalcolo === dataCalcolo).length;
    console.log(`${dataCalcolo}: ${total} righe, ${changed} da aggiornare`);
  }

  console.log(`\nTotale: ${snapshots.length} righe esaminate, ${totalChanged} con valore diverso.`);
  if (changes.length > 0) {
    console.log("\nModifiche:");
    for (const c of changes) {
      console.log(`  ${c.dataCalcolo} · player ${c.playerId}: ${c.vecchioValore} -> ${c.nuovoValore}`);
    }
  }
  if (!APPLY) {
    console.log("\nDry run: nessuna scrittura eseguita. Rilancia con --apply per salvare.");
  } else {
    console.log("\nScritto su Supabase.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
