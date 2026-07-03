import { z } from "zod";

export const nuovaChecklistSchema = z.object({
  contrattoId: z.string().min(1),
  tipo: z.enum(["INGRESSO", "USCITA"]),
  note: z.string().max(2000).optional(),
  firmaProprietario: z.boolean().default(false),
});

export type NuovaChecklistInput = z.infer<typeof nuovaChecklistSchema>;
