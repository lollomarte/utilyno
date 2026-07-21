import { z } from "zod";
import { optionalString } from "@/lib/validations/common";

export const TIPO_UTENZA_OPTIONS = ["LUCE", "GAS", "ACQUA", "INTERNET"] as const;

export const attivaUtenzaSchema = z.object({
  immobileId: z.string().min(1),
  tipo: z.enum(TIPO_UTENZA_OPTIONS),
  fornitore: z.string().min(1, "Seleziona un fornitore"),
  // Dati opzionali per attivazione/voltura: compilabili solo quando disponibili.
  codicePod: optionalString,
  codicePdr: optionalString,
  fornitoreUscente: optionalString,
  indirizzoFornitura: optionalString,
});

export type AttivaUtenzaInput = z.infer<typeof attivaUtenzaSchema>;
export type AttivaUtenzaFormInput = z.input<typeof attivaUtenzaSchema>;
