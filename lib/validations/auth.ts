import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(1, "La password è obbligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const baseRegisterSchema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio"),
  cognome: z.string().min(1, "Il cognome è obbligatorio"),
  email: z.string().email("Inserisci un'email valida"),
  telefono: z.string().optional(),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
});

export const registerSchema = z.discriminatedUnion("role", [
  baseRegisterSchema.extend({
    role: z.literal("AGENZIA"),
    ragioneSociale: z.string().min(1, "La ragione sociale è obbligatoria"),
    piva: z.string().min(11, "La partita IVA deve avere 11 caratteri").max(11),
    indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  }),
  baseRegisterSchema.extend({
    role: z.literal("PROPRIETARIO"),
    codiceFiscale: z.string().min(16, "Il codice fiscale deve avere 16 caratteri").max(16),
    indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  }),
  baseRegisterSchema.extend({
    role: z.literal("INQUILINO"),
    codiceFiscale: z.string().min(16, "Il codice fiscale deve avere 16 caratteri").max(16),
  }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;

// Schema "piatto" usato solo lato client dal form: evita che react-hook-form
// tipizzi `errors` come unione discriminata (che impedirebbe l'accesso diretto
// ai campi specifici del ruolo). La validazione forte resta `registerSchema`.
export const registerFormSchema = z.object({
  role: z.enum(["AGENZIA", "PROPRIETARIO", "INQUILINO"]),
  nome: z.string().min(1, "Il nome è obbligatorio"),
  cognome: z.string().min(1, "Il cognome è obbligatorio"),
  email: z.string().email("Inserisci un'email valida"),
  telefono: z.string().optional(),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  ragioneSociale: z.string().optional(),
  piva: z.string().optional(),
  indirizzo: z.string().optional(),
  codiceFiscale: z.string().optional(),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
