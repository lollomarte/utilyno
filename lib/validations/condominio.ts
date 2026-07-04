import { z } from "zod";

export const nuovoCondominioSchema = z.object({
  nome: z.string().min(1, "Il nome del condominio è obbligatorio"),
  indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  comune: z.string().min(1, "Il comune è obbligatorio"),
  numeroUnita: z.coerce.number().int().positive("Il numero di unità deve essere maggiore di zero"),
});

export type NuovoCondominioInput = z.infer<typeof nuovoCondominioSchema>;
export type NuovoCondominioFormInput = z.input<typeof nuovoCondominioSchema>;

export const nuovaComunicazioneSchema = z.object({
  condominioId: z.string().min(1, "Seleziona un condominio"),
  titolo: z.string().min(1, "Il titolo è obbligatorio").max(120),
  testo: z.string().min(1, "Il testo è obbligatorio").max(4000),
});

export type NuovaComunicazioneInput = z.infer<typeof nuovaComunicazioneSchema>;
