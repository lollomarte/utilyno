import { z } from "zod";

export const TIPO_UTENZA_OPTIONS = ["LUCE", "GAS", "ACQUA", "INTERNET"] as const;

export const attivaUtenzaSchema = z.object({
  immobileId: z.string().min(1),
  tipo: z.enum(TIPO_UTENZA_OPTIONS),
  fornitore: z.string().min(1, "Seleziona un fornitore"),
});

export type AttivaUtenzaInput = z.infer<typeof attivaUtenzaSchema>;
