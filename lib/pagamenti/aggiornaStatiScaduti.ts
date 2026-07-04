import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

const GIORNI_SOGLIA_RITARDO = 5;
const GIORNI_SOGLIA_INSOLUTO = 30;

/**
 * Non c'è un vero cron per la demo: questa funzione viene invocata "lazy"
 * a ogni caricamento delle dashboard rilevanti, e promuove gli stati dei
 * pagamenti scaduti prima che i dati vengano letti per il render.
 * Idempotente: rieseguirla non ha effetti collaterali se già aggiornata.
 */
export async function aggiornaPagamentiScaduti(): Promise<void> {
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
}
