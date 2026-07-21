import { z } from "zod";
import { optionalDate, optionalString } from "@/lib/validations/common";

export const CONTESTO_DOCUMENTO_OPTIONS = ["IMMOBILE", "CONTRATTO", "CONDOMINIO"] as const;

export const CATEGORIA_DOCUMENTO_OPTIONS = [
  "CONTRATTO",
  "APE",
  "PLANIMETRIA",
  "CARTA_IDENTITA",
  "VISURA_CATASTALE",
  "POLIZZA",
  "ALTRO",
] as const;

export const nuovoDocumentoSchema = z.object({
  contestoTipo: z.enum(CONTESTO_DOCUMENTO_OPTIONS),
  contestoId: z.string().min(1, "Seleziona a cosa collegare il documento"),
  scadenzaAutoEliminazione: z
    .union([z.string().length(0), z.coerce.date()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  destinatari: z.array(z.string().min(1)).default([]),
  // Classificazione business (distinta dal MIME tecnico) e scadenza reale del documento: opzionali.
  categoria: z
    .union([z.enum(CATEGORIA_DOCUMENTO_OPTIONS), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  scadenzaDocumento: optionalDate,
  nota: optionalString,
});

export type NuovoDocumentoInput = z.infer<typeof nuovoDocumentoSchema>;

/** `documentoId` arriva da un link cliccabile: rivalidato a runtime come ogni input esterno. */
export const documentoIdSchema = z.object({ documentoId: z.string().min(1) });
