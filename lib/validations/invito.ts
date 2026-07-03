import { z } from "zod";

export const completaInvitoSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
    confermaPassword: z.string().min(1, "Conferma la password"),
  })
  .refine((data) => data.password === data.confermaPassword, {
    message: "Le password non coincidono",
    path: ["confermaPassword"],
  });

export type CompletaInvitoInput = z.infer<typeof completaInvitoSchema>;
