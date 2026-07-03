import { z } from "zod";

export const nuovoCondominioSchema = z.object({
  nome: z.string().min(1, "Il nome del condominio è obbligatorio"),
  indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  comune: z.string().min(1, "Il comune è obbligatorio"),
  numeroUnita: z.coerce.number().int().positive("Il numero di unità deve essere maggiore di zero"),
});

export type NuovoCondominioInput = z.infer<typeof nuovoCondominioSchema>;
export type NuovoCondominioFormInput = z.input<typeof nuovoCondominioSchema>;

export const segnalazioneCondominialeSchema = z.object({
  condominioId: z.string().min(1, "Seleziona un condominio"),
  titolo: z.string().min(1, "Il titolo è obbligatorio").max(120),
  descrizione: z.string().min(1, "La descrizione è obbligatoria").max(2000),
  priorita: z.enum(["BASSA", "MEDIA", "ALTA"]),
});

export type SegnalazioneCondominialeInput = z.infer<typeof segnalazioneCondominialeSchema>;
