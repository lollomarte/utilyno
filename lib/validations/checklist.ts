import { z } from "zod";
import { optionalNumber } from "@/lib/validations/common";

export const nuovaChecklistSchema = z.object({
  contrattoId: z.string().min(1),
  tipo: z.enum(["INGRESSO", "USCITA"]),
  note: z.string().max(2000).optional(),
  firmaProprietario: z.boolean().default(false),
  // Letture contatori a verbale: opzionali, utili per voltura utenze e contestazioni consumi.
  letturaLuce: optionalNumber,
  letturaGas: optionalNumber,
  letturaAcqua: optionalNumber,
});

export type NuovaChecklistInput = z.infer<typeof nuovaChecklistSchema>;
