import { z } from "zod";

/**
 * Numero opzionale raccolto da un <input type="number"> che può restare vuoto: senza il
 * passaggio per stringa vuota, z.coerce.number() coercerebbe "" a 0 invece di "non compilato".
 * Stesso spirito di scadenzaAutoEliminazione in lib/validations/documento.ts per le date opzionali.
 * Il cast dopo il controllo è sicuro: l'unico membro dell'union che supera length(0) è quello
 * già coercito a number da z.coerce.number(), TS però non riesce a stringere l'union da solo.
 */
export const optionalNumber = z
  .union([z.string().length(0), z.coerce.number()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : (v as number)));

/** Data opzionale raccolta da un <input type="date">: stesso pattern di optionalNumber. */
export const optionalDate = z
  .union([z.string().length(0), z.coerce.date()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : (v as Date)));

/** Stringa opzionale che tratta "" come "non compilato" (invece di una stringa vuota valida). */
export const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));
