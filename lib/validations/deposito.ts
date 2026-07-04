import { z } from "zod";

export const gestisciRestituzioneDepositoSchema = z.discriminatedUnion("esito", [
  z.object({
    contrattoId: z.string().min(1),
    esito: z.literal("RESTITUITO"),
  }),
  z.object({
    contrattoId: z.string().min(1),
    esito: z.literal("IN_CONTESTAZIONE"),
    note: z.string().trim().min(1, "Indica il motivo della contestazione"),
  }),
]);

export type GestisciRestituzioneDepositoInput = z.infer<typeof gestisciRestituzioneDepositoSchema>;
