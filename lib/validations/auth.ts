import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(1, "La password è obbligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const pivaSchema = z
  .string()
  .regex(/^\d{11}$/, "La Partita IVA deve avere esattamente 11 cifre numeriche");

const codiceFiscaleSchema = z
  .string()
  .regex(
    /^[A-Za-z]{6}\d{2}[A-Za-z]\d{2}[A-Za-z]\d{3}[A-Za-z]$/,
    "Il codice fiscale deve essere in formato valido (16 caratteri, es. RSSMRA80A01H501U)"
  );

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
    piva: pivaSchema,
    indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  }),
  baseRegisterSchema.extend({
    role: z.literal("AMMINISTRATORE"),
    ragioneSociale: z.string().min(1, "La ragione sociale è obbligatoria"),
    piva: pivaSchema,
    indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  }),
  baseRegisterSchema.extend({
    role: z.literal("PROPRIETARIO"),
    codiceFiscale: codiceFiscaleSchema,
    indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  }),
  baseRegisterSchema.extend({
    role: z.literal("INQUILINO"),
    codiceFiscale: codiceFiscaleSchema,
  }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;

// Schema "piatto" usato solo lato client dal form: evita che react-hook-form
// tipizzi `errors` come unione discriminata (che impedirebbe l'accesso diretto
// ai campi specifici del ruolo). La validazione forte resta `registerSchema`,
// applicata di nuovo prima dell'invio e lato server in /api/register.
export const registerFormSchema = z.object({
  role: z.enum(["AGENZIA", "AMMINISTRATORE", "PROPRIETARIO", "INQUILINO"]),
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
