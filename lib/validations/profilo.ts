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

/**
 * Modifica il profilo Privato: codice fiscale e tipoSoggetto restano di sola lettura (dati
 * identificativi, non si cambia da persona fisica ad azienda dopo la registrazione). I campi
 * azienda (ragioneSociale/piva/referente) sono opzionali qui perché il form li mostra solo se
 * il profilo è già AZIENDA — la validazione "obbligatorio se azienda" resta in fase di
 * registrazione, non va riapplicata rigidamente in modifica.
 */
export const aggiornaPrivatoSchema = z.object({
  indirizzo: optionalString,
  iban: optionalString,
  ragioneSociale: optionalString,
  piva: optionalString,
  referenteNome: optionalString,
  referenteRuolo: optionalString,
});
export type AggiornaPrivatoInput = z.infer<typeof aggiornaPrivatoSchema>;
export type AggiornaPrivatoFormInput = z.input<typeof aggiornaPrivatoSchema>;
