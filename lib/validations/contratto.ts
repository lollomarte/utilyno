import { z } from "zod";

export const nuovoContrattoSchema = z.object({
  immobileId: z.string().min(1, "Seleziona un immobile"),
  inquilinoId: z.string().min(1, "Seleziona un inquilino"),
  tipoContratto: z.enum(["QUATTRO_PIU_QUATTRO", "TRE_PIU_DUE", "TRANSITORIO", "STUDENTI", "CONCORDATO"]),
  dataInizio: z.string().min(1, "Indica la data di inizio"),
  dataFine: z.string().min(1, "Indica la data di fine"),
  canoneMensile: z.coerce.number().positive("Il canone deve essere maggiore di zero"),
  regimeFiscale: z.enum(["CEDOLARE_SECCA", "ORDINARIO"]),
  depositoImporto: z.coerce.number().min(0, "Il deposito non può essere negativo"),
});

export type NuovoContrattoInput = z.infer<typeof nuovoContrattoSchema>;

export const DURATA_MESI_PER_TIPO: Record<NuovoContrattoInput["tipoContratto"], number> = {
  QUATTRO_PIU_QUATTRO: 48,
  TRE_PIU_DUE: 36,
  TRANSITORIO: 12,
  STUDENTI: 24,
  CONCORDATO: 36,
};
