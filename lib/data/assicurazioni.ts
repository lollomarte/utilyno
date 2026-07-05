import { getPartnerAttiviPerCategoria } from "@/lib/data/segnalazioni";
import { TIPI_COPERTURA, type TipoCopertura } from "@/lib/validations/assicurazione";

/** Fallback quando non ci sono Partner attivi con categoria ASSICURAZIONE. */
const FORNITORI_FALLBACK = ["Generali Italia", "Allianz", "UnipolSai"];

/** Premio annuale plausibile suggerito in base al tipo di copertura scelto (l'utente può modificarlo). */
export const PREMIO_SUGGERITO_PER_TIPO: Record<TipoCopertura, number> = {
  "Responsabilità civile": 120,
  "Incendio e scoppio": 220,
  "Multirischio abitazione": 380,
};

/** Fornitori proponibili per l'attivazione di una polizza: riusa i Partner convenzionati
 * (categoria ASSICURAZIONE) già usati dal sistema lead/preventivi, con lo stesso fallback
 * pattern già adottato per le utenze quando non risultano Partner attivi. */
export async function getFornitoriAssicurazione(): Promise<string[]> {
  const partner = await getPartnerAttiviPerCategoria("ASSICURAZIONE");
  if (partner.length > 0) return partner.map((p) => p.nome);
  return FORNITORI_FALLBACK;
}

export { TIPI_COPERTURA };
