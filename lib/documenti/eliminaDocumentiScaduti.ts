import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

/** Come INTERVALLO_MINIMO_MS in aggiornaStatiScaduti.ts: throttla il lavoro reale a una volta
 * ogni finestra per istanza, invece di rieseguirlo a ogni singolo caricamento di pagina. */
const INTERVALLO_MINIMO_MS = 5 * 60 * 1000;
let ultimaEsecuzione = 0;

/**
 * Non c'è un vero cron per la demo: l'eliminazione dei documenti con scadenza superata viene
 * invocata "lazy" a ogni lettura della lista documenti, prima che i dati vengano restituiti.
 * Cancella sia il record (e a cascata le sue DocumentoCondivisione) sia il file su Vercel Blob.
 * Un fallimento nella cancellazione del singolo blob non deve bloccare la cancellazione degli
 * altri documenti scaduti né la lettura della lista.
 */
export async function eliminaDocumentiScaduti(): Promise<void> {
  const ora = Date.now();
  if (ora - ultimaEsecuzione < INTERVALLO_MINIMO_MS) return;
  const precedente = ultimaEsecuzione;
  ultimaEsecuzione = ora;

  try {
    const scaduti = await prisma.documento.findMany({
      where: { scadenzaAutoEliminazione: { lt: new Date() } },
      select: { id: true, url: true },
    });
    if (scaduti.length === 0) return;

    await Promise.all(
      scaduti.map(async (doc) => {
        try {
          await del(doc.url);
        } catch (err) {
          console.error(`Impossibile eliminare il blob del documento ${doc.id}:`, err);
        }
      })
    );

    await prisma.documento.deleteMany({ where: { id: { in: scaduti.map((d) => d.id) } } });
  } catch (err) {
    ultimaEsecuzione = precedente;
    throw err;
  }
}
