import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

const GIORNI_SOGLIA_RITARDO = 5;
const GIORNI_SOGLIA_INSOLUTO = 30;

/** Sotto questa soglia di staleness, saltare del tutto le due updateMany: le
 * soglie di ritardo sono a granularità di giorni, quindi qualche minuto di
 * ritardo nell'aggiornamento è irrilevante, mentre risparmia due scritture
 * su ogni singolo caricamento di 6 pagine diverse (reale pressione sulla
 * connection pool, limitata a 5 connessioni). */
const INTERVALLO_MINIMO_MS = 5 * 60 * 1000;
let ultimaEsecuzione = 0;

/**
 * Non c'è un vero cron per la demo: questa funzione viene invocata "lazy"
 * a ogni caricamento delle dashboard rilevanti, e promuove gli stati dei
 * pagamenti scaduti prima che i dati vengano letti per il render.
 * Idempotente: rieseguirla non ha effetti collaterali se già aggiornata.
 * Throttled: al massimo una volta ogni INTERVALLO_MINIMO_MS per istanza.
 */
export async function aggiornaPagamentiScaduti(): Promise<void> {
  const ora = Date.now();
  if (ora - ultimaEsecuzione < INTERVALLO_MINIMO_MS) return;
  const precedente = ultimaEsecuzione;
  ultimaEsecuzione = ora; // ottimistico: evita che richieste concorrenti nella stessa finestra duplichino il lavoro

  try {
    const oggi = new Date();
    const sogliaRitardo = subDays(oggi, GIORNI_SOGLIA_RITARDO);
    const sogliaInsoluto = subDays(oggi, GIORNI_SOGLIA_INSOLUTO);

    // Oltre i 30 giorni di ritardo: INSOLUTO (da PROGRAMMATO o già IN_RITARDO).
    await prisma.pagamento.updateMany({
      where: { stato: { in: ["PROGRAMMATO", "IN_RITARDO"] }, dataScadenza: { lt: sogliaInsoluto } },
      data: { stato: "INSOLUTO" },
    });

    // Tra 5 e 30 giorni di ritardo: IN_RITARDO (solo se ancora PROGRAMMATO).
    await prisma.pagamento.updateMany({
      where: { stato: "PROGRAMMATO", dataScadenza: { lt: sogliaRitardo } },
      data: { stato: "IN_RITARDO" },
    });
  } catch (err) {
    ultimaEsecuzione = precedente; // permette un nuovo tentativo a breve invece di restare bloccati per 5 minuti
    throw err;
  }
}
