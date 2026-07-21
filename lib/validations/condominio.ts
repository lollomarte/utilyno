import { z } from "zod";
import { optionalNumber, optionalString } from "@/lib/validations/common";

/** Dati aggiuntivi opzionali per la polizza globale fabbricato e la gestione del condominio. */
const condominioDatiAggiuntiviFields = {
  codiceFiscale: optionalString,
  ibanCondominio: optionalString,
  annoCostruzione: optionalNumber,
  ascensore: z.boolean().optional(),
  impiantiComuni: z.array(z.string()).optional().default([]),
};

export const nuovoCondominioSchema = z.object({
  nome: z.string().min(1, "Il nome del condominio è obbligatorio"),
  indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  comune: z.string().min(1, "Il comune è obbligatorio"),
  numeroUnita: z.coerce.number().int().positive("Il numero di unità deve essere maggiore di zero"),
  ...condominioDatiAggiuntiviFields,
});

export type NuovoCondominioInput = z.infer<typeof nuovoCondominioSchema>;
export type NuovoCondominioFormInput = z.input<typeof nuovoCondominioSchema>;

/** Modifica i dati di un Condominio già esistente: prima d'ora non esisteva nessun form di modifica. */
export const aggiornaCondominioSchema = z.object({
  condominioId: z.string().min(1),
  nome: z.string().min(1, "Il nome del condominio è obbligatorio"),
  indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  comune: z.string().min(1, "Il comune è obbligatorio"),
  numeroUnita: z.coerce.number().int().positive("Il numero di unità deve essere maggiore di zero"),
  ...condominioDatiAggiuntiviFields,
});

export type AggiornaCondominioInput = z.infer<typeof aggiornaCondominioSchema>;
export type AggiornaCondominioFormInput = z.input<typeof aggiornaCondominioSchema>;

export const nuovaComunicazioneSchema = z.object({
  condominioId: z.string().min(1, "Seleziona un condominio"),
  titolo: z.string().min(1, "Il titolo è obbligatorio").max(120),
  testo: z.string().min(1, "Il testo è obbligatorio").max(4000),
});

export type NuovaComunicazioneInput = z.infer<typeof nuovaComunicazioneSchema>;
