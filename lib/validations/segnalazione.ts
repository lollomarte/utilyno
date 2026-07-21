import { z } from "zod";

export const CATEGORIA_SEGNALAZIONE_OPTIONS = [
  "PROBLEMA_UNITA",
  "PROBLEMA_CONDOMINIALE",
  "PROBLEMA_MISTO",
  "PROBLEMA_CONTRATTUALE",
] as const;

/** Asse indipendente dalla categoria di routing sopra: determina il matching con i Partner, non i destinatari. */
export const CATEGORIA_INTERVENTO_OPTIONS = [
  "IDRAULICO",
  "ELETTRICISTA",
  "CALDAIA_CLIMATIZZAZIONE",
  "MANUTENZIONE_GENERICA",
  "UTENZE_LUCE_GAS",
  "ASSICURAZIONE",
  "ALTRO",
] as const;

export const FASCIA_ORARIA_OPTIONS = ["Mattina", "Pomeriggio", "Sera", "Tutto il giorno"] as const;

export const nuovaSegnalazioneSchema = z.object({
  immobileId: z.string().min(1, "Seleziona un immobile"),
  categoria: z.enum(CATEGORIA_SEGNALAZIONE_OPTIONS).optional(),
  categoriaIntervento: z
    .union([z.enum(CATEGORIA_INTERVENTO_OPTIONS), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  titolo: z.string().min(1, "Il titolo è obbligatorio").max(120),
  descrizione: z.string().min(1, "La descrizione è obbligatoria").max(2000),
  priorita: z.enum(["BASSA", "MEDIA", "ALTA"]),
  // Opzionali: chi segnala potrebbe non avere foto o disponibilità precise da subito.
  fotoUrls: z.array(z.string()).optional().default([]),
  fasciaOrariaDisponibile: z
    .union([z.enum(FASCIA_ORARIA_OPTIONS), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type NuovaSegnalazioneInput = z.infer<typeof nuovaSegnalazioneSchema>;
export type NuovaSegnalazioneFormInput = z.input<typeof nuovaSegnalazioneSchema>;

export const rispostaSegnalazioneSchema = z.object({
  segnalazioneId: z.string().min(1),
  testo: z.string().min(1, "Scrivi qualcosa prima di inviare").max(2000),
});

export type RispostaSegnalazioneInput = z.infer<typeof rispostaSegnalazioneSchema>;

export const richiediPreventivoSchema = z.object({
  segnalazioneId: z.string().min(1),
  partnerId: z.string().min(1),
});

export type RichiediPreventivoInput = z.infer<typeof richiediPreventivoSchema>;

/** `stato` arriva tipizzato solo a compile-time: un client che chiama l'azione direttamente
 * (bypassando il form) potrebbe inviare qualunque stringa, quindi va rivalidata a runtime. */
export const aggiornaStatoSegnalazioneSchema = z.object({
  segnalazioneId: z.string().min(1),
  stato: z.enum(["APERTA", "IN_LAVORAZIONE", "RISOLTA"]),
});

export type AggiornaStatoSegnalazioneInput = z.infer<typeof aggiornaStatoSegnalazioneSchema>;
