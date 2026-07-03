import { z } from "zod";

export const nuovoTicketSchema = z.object({
  titolo: z.string().min(1, "Il titolo è obbligatorio").max(120),
  descrizione: z.string().min(1, "La descrizione è obbligatoria").max(2000),
  priorita: z.enum(["BASSA", "MEDIA", "ALTA"]),
});

export type NuovoTicketInput = z.infer<typeof nuovoTicketSchema>;
