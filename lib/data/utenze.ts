import { prisma } from "@/lib/prisma";
import type { TipoUtenza, StatoUtenza } from "@prisma/client";
import { getPartnerAttiviPerCategoria } from "@/lib/data/segnalazioni";

const TIPI_UTENZA: TipoUtenza[] = ["LUCE", "GAS", "ACQUA", "INTERNET"];

/** Fallback quando non ci sono Partner attivi per il tipo di utenza. */
const FORNITORI_FALLBACK: Record<TipoUtenza, string[]> = {
  LUCE: ["Enel Energia", "Eni Plenitude", "A2A"],
  GAS: ["Eni Plenitude", "A2A", "Enel Energia"],
  ACQUA: ["A2A", "Acquedotto Comunale"],
  INTERNET: ["TIM", "Fastweb"],
};

export interface UtenzaRigaCompleta {
  id: string | null;
  tipo: TipoUtenza;
  fornitore: string | null;
  stato: StatoUtenza;
  dataAttivazione: Date | null;
}

/**
 * Fornitori mock proponibili per un tipo di utenza. LUCE e GAS riusano i
 * Partner convenzionati (categoria UTENZE_LUCE_GAS) già usati dal sistema
 * lead/preventivi, per non duplicare due elenchi paralleli con lo stesso
 * scopo. ACQUA e INTERNET non hanno ancora una categoria Partner dedicata
 * e usano un elenco fisso di fallback (usato anche se per LUCE/GAS non
 * risultano Partner attivi).
 */
export async function getFornitoriPerTipoUtenza(tipo: TipoUtenza): Promise<string[]> {
  if (tipo === "LUCE" || tipo === "GAS") {
    const partner = await getPartnerAttiviPerCategoria("UTENZE_LUCE_GAS");
    if (partner.length > 0) return partner.map((p) => p.nome);
  }
  return FORNITORI_FALLBACK[tipo];
}

/** Fornitori mock proponibili per ciascuno dei 4 tipi di utenza, in un'unica chiamata comoda per la UI. */
export async function getFornitoriPerTutteLeUtenze(): Promise<Record<TipoUtenza, string[]>> {
  const entries = await Promise.all(TIPI_UTENZA.map(async (tipo) => [tipo, await getFornitoriPerTipoUtenza(tipo)] as const));
  return Object.fromEntries(entries) as Record<TipoUtenza, string[]>;
}

/** Le 4 utenze di un immobile, completate con una riga "DA_ATTIVARE" segnaposto per i tipi non ancora presenti. */
export async function getUtenzeComplete(immobileId: string): Promise<UtenzaRigaCompleta[]> {
  const utenze = await prisma.utenza.findMany({ where: { immobileId } });

  return TIPI_UTENZA.map((tipo) => {
    const esistente = utenze.find((u) => u.tipo === tipo);
    if (esistente) return esistente;
    return { id: null, tipo, fornitore: null, stato: "DA_ATTIVARE" as const, dataAttivazione: null };
  });
}
