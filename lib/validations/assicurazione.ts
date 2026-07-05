import { z } from "zod";

export const TIPI_COPERTURA = ["Responsabilità civile", "Incendio e scoppio", "Multirischio abitazione"] as const;
export type TipoCopertura = (typeof TIPI_COPERTURA)[number];

export const attivaAssicurazioneSchema = z.object({
  immobileId: z.string().min(1),
  tipo: z.enum(TIPI_COPERTURA, { message: "Seleziona un tipo di copertura" }),
  fornitore: z.string().min(1, "Seleziona un fornitore"),
  premioAnnuale: z.coerce.number().positive("Il premio annuale deve essere maggiore di zero"),
});

export type AttivaAssicurazioneInput = z.infer<typeof attivaAssicurazioneSchema>;
export type AttivaAssicurazioneFormInput = z.input<typeof attivaAssicurazioneSchema>;

export const rinnovaAssicurazioneSchema = z.object({
  assicurazioneId: z.string().min(1),
  premioAnnuale: z.coerce.number().positive("Il premio annuale deve essere maggiore di zero"),
});

export type RinnovaAssicurazioneInput = z.infer<typeof rinnovaAssicurazioneSchema>;
export type RinnovaAssicurazioneFormInput = z.input<typeof rinnovaAssicurazioneSchema>;
