import { z } from "zod";

export const CATEGORIA_SEGNALAZIONE_OPTIONS = [
  "PROBLEMA_UNITA",
  "PROBLEMA_CONDOMINIALE",
  "PROBLEMA_MISTO",
  "PROBLEMA_CONTRATTUALE",
] as const;

export const nuovaSegnalazioneSchema = z.object({
  immobileId: z.string().min(1, "Seleziona un immobile"),
  categoria: z.enum(CATEGORIA_SEGNALAZIONE_OPTIONS).optional(),
  titolo: z.string().min(1, "Il titolo è obbligatorio").max(120),
  descrizione: z.string().min(1, "La descrizione è obbligatoria").max(2000),
  priorita: z.enum(["BASSA", "MEDIA", "ALTA"]),
});

export type NuovaSegnalazioneInput = z.infer<typeof nuovaSegnalazioneSchema>;
export type NuovaSegnalazioneFormInput = z.input<typeof nuovaSegnalazioneSchema>;

export const rispostaSegnalazioneSchema = z.object({
  segnalazioneId: z.string().min(1),
  testo: z.string().min(1, "Scrivi qualcosa prima di inviare").max(2000),
});

export type RispostaSegnalazioneInput = z.infer<typeof rispostaSegnalazioneSchema>;
