import { z } from "zod";
import { optionalString } from "@/lib/validations/common";

const pivaSchema = z.string().regex(/^\d{11}$/, "La Partita IVA deve avere esattamente 11 cifre numeriche");

/**
 * Modifica il profilo business di Agenzia/Amministratore: prima d'ora questi dati erano
 * scrivibili solo in fase di registrazione, senza nessun modo di tornare a completarli.
 */
export const aggiornaAgenziaSchema = z.object({
  ragioneSociale: z.string().min(1, "La ragione sociale è obbligatoria"),
  piva: pivaSchema,
  indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  telefono: optionalString,
  pec: optionalString,
  codiceSdi: optionalString,
  ibanAgenzia: optionalString,
});
export type AggiornaAgenziaInput = z.infer<typeof aggiornaAgenziaSchema>;
export type AggiornaAgenziaFormInput = z.input<typeof aggiornaAgenziaSchema>;

export const aggiornaAmministratoreSchema = z.object({
  ragioneSociale: z.string().min(1, "La ragione sociale è obbligatoria"),
  piva: pivaSchema,
  indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  telefono: optionalString,
  pec: optionalString,
  codiceSdi: optionalString,
});
export type AggiornaAmministratoreInput = z.infer<typeof aggiornaAmministratoreSchema>;
export type AggiornaAmministratoreFormInput = z.input<typeof aggiornaAmministratoreSchema>;

/** Solo indirizzo e IBAN: il codice fiscale resta di sola lettura (dato identificativo). */
export const aggiornaProprietarioSchema = z.object({
  indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  ibanProprietario: optionalString,
});
export type AggiornaProprietarioInput = z.infer<typeof aggiornaProprietarioSchema>;
export type AggiornaProprietarioFormInput = z.input<typeof aggiornaProprietarioSchema>;
