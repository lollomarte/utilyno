import { z } from "zod";

export const CONTESTO_DOCUMENTO_OPTIONS = ["IMMOBILE", "CONTRATTO", "CONDOMINIO"] as const;

export const nuovoDocumentoSchema = z.object({
  contestoTipo: z.enum(CONTESTO_DOCUMENTO_OPTIONS),
  contestoId: z.string().min(1, "Seleziona a cosa collegare il documento"),
  scadenzaAutoEliminazione: z
    .union([z.string().length(0), z.coerce.date()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  destinatari: z.array(z.string().min(1)).default([]),
});

export type NuovoDocumentoInput = z.infer<typeof nuovoDocumentoSchema>;

/** `documentoId` arriva da un link cliccabile: rivalidato a runtime come ogni input esterno. */
export const documentoIdSchema = z.object({ documentoId: z.string().min(1) });
