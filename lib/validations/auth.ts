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

const privatoFields = {
  tipoSoggetto: z.enum(["PERSONA_FISICA", "AZIENDA"]),
  codiceFiscale: z.string().optional(),
  ragioneSociale: z.string().optional(),
  piva: z.string().optional(),
  referenteNome: z.string().optional(),
  referenteRuolo: z.string().optional(),
};

/** Validazione condizionale in base a tipoSoggetto, non a livello di constraint DB (che restano
 * tutti nullable sul modello Privato, per restare flessibile): persona fisica richiede il
 * codice fiscale personale, azienda richiede ragione sociale/P.IVA/codice fiscale azienda/dati
 * del referente. Applicata con superRefine sull'intero discriminatedUnion (non sul singolo
 * membro "PRIVATO"): un membro con superRefine proprio perderebbe la forma ZodObject richiesta
 * da z.discriminatedUnion per riconoscere il discriminante. */
function validaPrivato(
  data: {
    role: string;
    tipoSoggetto?: "PERSONA_FISICA" | "AZIENDA";
    codiceFiscale?: string;
    ragioneSociale?: string;
    piva?: string;
    referenteNome?: string;
    referenteRuolo?: string;
  },
  ctx: z.RefinementCtx
) {
  if (data.role !== "PRIVATO") return;

  if (data.tipoSoggetto === "PERSONA_FISICA") {
    const cfResult = codiceFiscaleSchema.safeParse(data.codiceFiscale);
    if (!cfResult.success) {
      ctx.addIssue({
        code: "custom",
        path: ["codiceFiscale"],
        message: "Il codice fiscale deve essere in formato valido (16 caratteri, es. RSSMRA80A01H501U)",
      });
    }
    return;
  }

  if (!data.ragioneSociale) {
    ctx.addIssue({ code: "custom", path: ["ragioneSociale"], message: "La ragione sociale è obbligatoria" });
  }
  const pivaResult = pivaSchema.safeParse(data.piva);
  if (!pivaResult.success) {
    ctx.addIssue({ code: "custom", path: ["piva"], message: "La Partita IVA deve avere esattamente 11 cifre numeriche" });
  }
  if (!data.codiceFiscale) {
    ctx.addIssue({ code: "custom", path: ["codiceFiscale"], message: "Il codice fiscale dell'azienda è obbligatorio" });
  }
  if (!data.referenteNome) {
    ctx.addIssue({ code: "custom", path: ["referenteNome"], message: "Il nome del referente è obbligatorio" });
  }
  if (!data.referenteRuolo) {
    ctx.addIssue({ code: "custom", path: ["referenteRuolo"], message: "Il ruolo del referente è obbligatorio" });
  }
}

export const registerSchema = z
  .discriminatedUnion("role", [
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
    // Registrazione unificata per i privati: tipoSoggetto (persona fisica/azienda) si sceglie
    // subito in fase di registrazione (vedi validaPrivato per i campi richiesti in base alla
    // scelta) — a differenza di ruolo Proprietario/Inquilino, che non esiste più a livello di
    // account e si sceglie invece per-immobile nel flusso "Aggiungi immobile" post-registrazione.
    baseRegisterSchema.extend({
      role: z.literal("PRIVATO"),
      ...privatoFields,
    }),
  ])
  .superRefine(validaPrivato);

export type RegisterInput = z.infer<typeof registerSchema>;

// Schema "piatto" usato solo lato client dal form: evita che react-hook-form
// tipizzi `errors` come unione discriminata (che impedirebbe l'accesso diretto
// ai campi specifici del ruolo). La validazione forte resta `registerSchema`,
// applicata di nuovo prima dell'invio e lato server in /api/register.
export const registerFormSchema = z.object({
  role: z.enum(["AGENZIA", "AMMINISTRATORE", "PRIVATO"]),
  nome: z.string().min(1, "Il nome è obbligatorio"),
  cognome: z.string().min(1, "Il cognome è obbligatorio"),
  email: z.string().email("Inserisci un'email valida"),
  telefono: z.string().optional(),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  ragioneSociale: z.string().optional(),
  piva: z.string().optional(),
  indirizzo: z.string().optional(),
  tipoSoggetto: z.enum(["PERSONA_FISICA", "AZIENDA"]).optional(),
  codiceFiscale: z.string().optional(),
  referenteNome: z.string().optional(),
  referenteRuolo: z.string().optional(),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
