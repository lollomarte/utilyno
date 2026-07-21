/**
 * Seed disattivato deliberatamente: l'ambiente di sviluppo deve restare vuoto (solo schema,
 * zero record) per un onboarding reale da zero. Riattivarlo richiederebbe di riscriverlo da capo
 * per il modello Privato unificato — i vecchi dati demo (Proprietario/Inquilino separati) non
 * sono più compatibili con lo schema corrente.
 */
async function main() {
  console.log("Seed disattivato: nessun dato di demo viene creato.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
