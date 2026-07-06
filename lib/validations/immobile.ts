import { z } from "zod";

const codiceFiscaleSchema = z
  .string()
  .regex(
    /^[A-Za-z]{6}\d{2}[A-Za-z]\d{2}[A-Za-z]\d{3}[A-Za-z]$/,
    "Il codice fiscale deve essere in formato valido (16 caratteri, es. RSSMRA80A01H501U)"
  );

const proprietarioFields = {
  proprietarioMode: z.enum(["esistente", "nuovo"]),
  proprietarioId: z.string().optional(),
  proprietarioNome: z.string().optional(),
  proprietarioCognome: z.string().optional(),
  proprietarioEmail: z.string().optional(),
  proprietarioCodiceFiscale: z.string().optional(),
  proprietarioIndirizzo: z.string().optional(),
  proprietarioPassword: z.string().optional(),
};

/** Campi base condivisi da ogni form che crea un Immobile, incluso quello semplificato del Proprietario. */
const immobileBaseFields = {
  indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
  comune: z.string().min(1, "Il comune è obbligatorio"),
  provincia: z.string().regex(/^[A-Za-z]{2}$/, "La provincia deve essere una sigla di 2 lettere (es. MI)"),
  datiCatastali: z.string().min(1, "I dati catastali sono obbligatori"),
  superficieMq: z.coerce.number().positive("La superficie deve essere maggiore di zero"),
  tipoImmobile: z.enum(["RESIDENZIALE", "COMMERCIALE"]),
  apeClasse: z.string().optional(),
  valoreStimato: z.coerce.number().positive("Il valore stimato deve essere maggiore di zero"),
};

/** Validazione condivisa del blocco "proprietario esistente|nuovo", riusata da ogni form che crea un Immobile. */
function validaProprietario(
  data: {
    proprietarioMode: "esistente" | "nuovo";
    proprietarioId?: string;
    proprietarioNome?: string;
    proprietarioCognome?: string;
    proprietarioEmail?: string;
    proprietarioCodiceFiscale?: string;
    proprietarioIndirizzo?: string;
    proprietarioPassword?: string;
  },
  ctx: z.RefinementCtx
) {
  if (data.proprietarioMode === "esistente") {
    if (!data.proprietarioId) {
      ctx.addIssue({ code: "custom", path: ["proprietarioId"], message: "Seleziona un proprietario esistente" });
    }
    return;
  }

  if (!data.proprietarioNome) {
    ctx.addIssue({ code: "custom", path: ["proprietarioNome"], message: "Il nome è obbligatorio" });
  }
  if (!data.proprietarioCognome) {
    ctx.addIssue({ code: "custom", path: ["proprietarioCognome"], message: "Il cognome è obbligatorio" });
  }
  const emailResult = z.string().email().safeParse(data.proprietarioEmail);
  if (!emailResult.success) {
    ctx.addIssue({ code: "custom", path: ["proprietarioEmail"], message: "Inserisci un'email valida" });
  }
  const cfResult = codiceFiscaleSchema.safeParse(data.proprietarioCodiceFiscale);
  if (!cfResult.success) {
    ctx.addIssue({
      code: "custom",
      path: ["proprietarioCodiceFiscale"],
      message: "Il codice fiscale deve essere in formato valido (16 caratteri, es. RSSMRA80A01H501U)",
    });
  }
  if (!data.proprietarioIndirizzo) {
    ctx.addIssue({ code: "custom", path: ["proprietarioIndirizzo"], message: "L'indirizzo è obbligatorio" });
  }
  if (!data.proprietarioPassword || data.proprietarioPassword.length < 8) {
    ctx.addIssue({
      code: "custom",
      path: ["proprietarioPassword"],
      message: "La password deve avere almeno 8 caratteri",
    });
  }
}

export const nuovoImmobileSchema = z
  .object({
    indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
    comune: z.string().min(1, "Il comune è obbligatorio"),
    provincia: z
      .string()
      .regex(/^[A-Za-z]{2}$/, "La provincia deve essere una sigla di 2 lettere (es. MI)"),
    datiCatastali: z.string().min(1, "I dati catastali sono obbligatori"),
    superficieMq: z.coerce.number().positive("La superficie deve essere maggiore di zero"),
    tipoImmobile: z.enum(["RESIDENZIALE", "COMMERCIALE"]),
    apeClasse: z.string().optional(),
    valoreStimato: z.coerce.number().positive("Il valore stimato deve essere maggiore di zero"),
    condominioId: z.string().optional(),
    ...proprietarioFields,
  })
  .superRefine(validaProprietario);

export type NuovoImmobileInput = z.infer<typeof nuovoImmobileSchema>;
// Tipo "di input" (prima della coercizione numerica): usato da react-hook-form,
// che raccoglie i valori come stringhe prima che zodResolver li validi/converta.
export type NuovoImmobileFormInput = z.input<typeof nuovoImmobileSchema>;

/** Collega un Immobile esistente (non ancora assegnato a nessun condominio) al condominio corrente. */
export const collegaImmobileEsistenteSchema = z.object({
  condominioId: z.string().min(1),
  immobileId: z.string().min(1, "Seleziona un immobile"),
});
export type CollegaImmobileEsistenteInput = z.infer<typeof collegaImmobileEsistenteSchema>;

/**
 * Crea un Immobile minimo dal Portale Amministratore, collegandolo automaticamente
 * al condominio corrente. A differenza del flusso Agenzia, richiede di indicare
 * l'agenzia di riferimento (l'Amministratore non ne ha una propria).
 */
export const creaImmobilePerCondominioSchema = z
  .object({
    condominioId: z.string().min(1),
    indirizzo: z.string().min(1, "L'indirizzo è obbligatorio"),
    comune: z.string().min(1, "Il comune è obbligatorio"),
    provincia: z
      .string()
      .regex(/^[A-Za-z]{2}$/, "La provincia deve essere una sigla di 2 lettere (es. MI)"),
    datiCatastali: z.string().min(1, "I dati catastali sono obbligatori"),
    superficieMq: z.coerce.number().positive("La superficie deve essere maggiore di zero"),
    tipoImmobile: z.enum(["RESIDENZIALE", "COMMERCIALE"]),
    apeClasse: z.string().optional(),
    valoreStimato: z.coerce.number().positive("Il valore stimato deve essere maggiore di zero"),
    agenziaId: z.string().min(1, "Seleziona un'agenzia di riferimento"),
    ...proprietarioFields,
  })
  .superRefine(validaProprietario);

export type CreaImmobilePerCondominioInput = z.infer<typeof creaImmobilePerCondominioSchema>;
export type CreaImmobilePerCondominioFormInput = z.input<typeof creaImmobilePerCondominioSchema>;

/**
 * Form semplificato con cui il Proprietario auto-inserisce un Immobile: nessun blocco
 * proprietario (è sempre l'utente corrente) né condominio/agenzia, a differenza degli altri
 * flussi di creazione. Nasce in stato BOZZA_PROPRIETARIO, senza contratto.
 */
export const nuovoImmobileProprietarioSchema = z.object(immobileBaseFields);
export type NuovoImmobileProprietarioInput = z.infer<typeof nuovoImmobileProprietarioSchema>;
export type NuovoImmobileProprietarioFormInput = z.input<typeof nuovoImmobileProprietarioSchema>;

export const richiediGestioneImmobileSchema = z.object({
  immobileId: z.string().min(1),
  agenziaId: z.string().min(1, "Seleziona un'agenzia"),
  messaggio: z.string().max(1000).optional(),
});
export type RichiediGestioneImmobileInput = z.infer<typeof richiediGestioneImmobileSchema>;

export const rispondiRichiestaGestioneSchema = z.object({
  richiestaId: z.string().min(1),
  accetta: z.boolean(),
});
export type RispondiRichiestaGestioneInput = z.infer<typeof rispondiRichiestaGestioneSchema>;
