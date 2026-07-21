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

/** Un Privato già autenticato collega un contratto esistente al proprio account tramite il
 * token di invito ricevuto dall'agenzia/proprietario, dal flusso "Aggiungi immobile" — distinto
 * da completaInvitoSchema, che serve invece a impostare la password iniziale per chi non ha
 * ancora effettuato il primo accesso. */
export const redimiInvitoSchema = z.object({
  token: z.string().min(1, "Inserisci il codice di invito"),
});
export type RedimiInvitoInput = z.infer<typeof redimiInvitoSchema>;
