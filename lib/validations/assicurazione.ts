import { z } from "zod";

export const attivaAssicurazioneSchema = z.object({
  immobileId: z.string().min(1),
  tipo: z.string().min(1, "Il tipo di copertura è obbligatorio"),
  premioAnnuale: z.coerce.number().positive("Il premio annuale deve essere maggiore di zero"),
});

export type AttivaAssicurazioneInput = z.infer<typeof attivaAssicurazioneSchema>;
export type AttivaAssicurazioneFormInput = z.input<typeof attivaAssicurazioneSchema>;
