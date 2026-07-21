import { z } from "zod";

export const nuovaNotaSviluppatoreSchema = z.object({
  tipo: z.enum(["BUG", "SUGGERIMENTO"]),
  testo: z.string().min(1, "Scrivi qualcosa prima di inviare").max(2000),
});

export type NuovaNotaSviluppatoreInput = z.infer<typeof nuovaNotaSviluppatoreSchema>;
