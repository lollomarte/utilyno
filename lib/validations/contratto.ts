import { z } from "zod";

const codiceFiscaleSchema = z
  .string()
  .regex(
    /^[A-Za-z]{6}\d{2}[A-Za-z]\d{2}[A-Za-z]\d{3}[A-Za-z]$/,
    "Il codice fiscale deve essere in formato valido (16 caratteri, es. RSSMRA80A01H501U)"
  );

export const nuovoContrattoSchema = z
  .object({
    immobileId: z.string().min(1, "Seleziona un immobile"),
    tipoContratto: z.enum(["QUATTRO_PIU_QUATTRO", "TRE_PIU_DUE", "TRANSITORIO", "STUDENTI", "CONCORDATO"]),
    dataInizio: z.string().min(1, "Indica la data di inizio"),
    dataFine: z.string().min(1, "Indica la data di fine"),
    canoneMensile: z.coerce.number().positive("Il canone deve essere maggiore di zero"),
    regimeFiscale: z.enum(["CEDOLARE_SECCA", "ORDINARIO"]),
    depositoImporto: z.coerce.number().min(0, "Il deposito non può essere negativo"),

    inquilinoMode: z.enum(["esistente", "nuovo"]).default("esistente"),
    inquilinoId: z.string().optional(),
    inquilinoNome: z.string().optional(),
    inquilinoCognome: z.string().optional(),
    inquilinoEmail: z.string().optional(),
    inquilinoCodiceFiscale: z.string().optional(),
    inquilinoTelefono: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.inquilinoMode === "esistente") {
      if (!data.inquilinoId) {
        ctx.addIssue({ code: "custom", path: ["inquilinoId"], message: "Seleziona un inquilino esistente" });
      }
      return;
    }

    if (!data.inquilinoNome) {
      ctx.addIssue({ code: "custom", path: ["inquilinoNome"], message: "Il nome è obbligatorio" });
    }
    if (!data.inquilinoCognome) {
      ctx.addIssue({ code: "custom", path: ["inquilinoCognome"], message: "Il cognome è obbligatorio" });
    }
    const emailResult = z.string().email().safeParse(data.inquilinoEmail);
    if (!emailResult.success) {
      ctx.addIssue({ code: "custom", path: ["inquilinoEmail"], message: "Inserisci un'email valida" });
    }
    const cfResult = codiceFiscaleSchema.safeParse(data.inquilinoCodiceFiscale);
    if (!cfResult.success) {
      ctx.addIssue({
        code: "custom",
        path: ["inquilinoCodiceFiscale"],
        message: "Il codice fiscale deve essere in formato valido (16 caratteri, es. RSSMRA80A01H501U)",
      });
    }
  });

export type NuovoContrattoInput = z.infer<typeof nuovoContrattoSchema>;

export const DURATA_MESI_PER_TIPO: Record<NuovoContrattoInput["tipoContratto"], number> = {
  QUATTRO_PIU_QUATTRO: 48,
  TRE_PIU_DUE: 36,
  TRANSITORIO: 12,
  STUDENTI: 24,
  CONCORDATO: 36,
};
