import { formatCurrency, formatDate } from "@/lib/utils";
import { CONDIZIONE_IMMOBILE_LABELS, TIPO_RISCALDAMENTO_LABELS } from "@/lib/labels";
import type { CondizioneImmobile, TipoRiscaldamento } from "@prisma/client";

interface ImmobileConDatiAggiuntivi {
  foglio: string | null;
  particella: string | null;
  subalterno: string | null;
  categoriaCatastale: string | null;
  renditaCatastale: number | null;
  apeScadenza: Date | null;
  numeroVani: number | null;
  piano: string | null;
  ascensore: boolean | null;
  annoCostruzione: number | null;
  condizioneImmobile: CondizioneImmobile | null;
  arredato: boolean | null;
  dotazioni: string[];
  tipoRiscaldamento: TipoRiscaldamento | null;
  speseCondominialiMensili: number | null;
  noteStima: string | null;
}

/**
 * Righe da mostrare in una DescriptionList per i "dati aggiuntivi opzionali" di un Immobile:
 * solo quelle compilate, condivise dalle viste Proprietario e Agenzia (stessi campi, stesso
 * ordine) per non duplicare questa logica in ogni pagina di dettaglio.
 */
export function datiAggiuntiviImmobileRows(immobile: ImmobileConDatiAggiuntivi): { label: string; value: React.ReactNode }[] {
  const catastale = [immobile.foglio, immobile.particella, immobile.subalterno].filter(Boolean);
  const rows: { label: string; value: React.ReactNode }[] = [];

  if (catastale.length > 0 || immobile.categoriaCatastale || immobile.renditaCatastale) {
    rows.push({
      label: "Dati catastali",
      value: [
        catastale.length > 0 ? `Fg. ${immobile.foglio ?? "-"}, Part. ${immobile.particella ?? "-"}, Sub. ${immobile.subalterno ?? "-"}` : null,
        immobile.categoriaCatastale ? `Categoria ${immobile.categoriaCatastale}` : null,
        immobile.renditaCatastale ? `Rendita ${formatCurrency(immobile.renditaCatastale)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }
  if (immobile.apeScadenza) rows.push({ label: "Scadenza APE", value: formatDate(immobile.apeScadenza) });
  if (immobile.numeroVani) rows.push({ label: "Numero vani", value: immobile.numeroVani });
  if (immobile.piano) rows.push({ label: "Piano", value: immobile.piano });
  if (immobile.ascensore !== null) rows.push({ label: "Ascensore", value: immobile.ascensore ? "Sì" : "No" });
  if (immobile.annoCostruzione) rows.push({ label: "Anno di costruzione", value: immobile.annoCostruzione });
  if (immobile.condizioneImmobile) {
    rows.push({ label: "Condizione", value: CONDIZIONE_IMMOBILE_LABELS[immobile.condizioneImmobile] });
  }
  if (immobile.arredato !== null) rows.push({ label: "Arredato", value: immobile.arredato ? "Sì" : "No" });
  if (immobile.dotazioni.length > 0) rows.push({ label: "Dotazioni", value: immobile.dotazioni.join(", ") });
  if (immobile.tipoRiscaldamento) {
    rows.push({ label: "Riscaldamento", value: TIPO_RISCALDAMENTO_LABELS[immobile.tipoRiscaldamento] });
  }
  if (immobile.speseCondominialiMensili) {
    rows.push({ label: "Spese condominiali mensili", value: formatCurrency(immobile.speseCondominialiMensili) });
  }
  if (immobile.noteStima) rows.push({ label: "Note per stima valore", value: immobile.noteStima });

  return rows;
}
