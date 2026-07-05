import { z } from "zod";
import { CATEGORIA_INTERVENTO_OPTIONS } from "@/lib/validations/segnalazione";

export const partnerSchema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio").max(120),
  categoria: z.enum(CATEGORIA_INTERVENTO_OPTIONS),
  zonaCopertura: z.string().min(1, "La zona di copertura è obbligatoria").max(200),
  telefono: z.string().min(1, "Il telefono è obbligatorio").max(40),
  email: z.string().email("Email non valida"),
  contattoReferente: z.string().min(1, "Il contatto referente è obbligatorio").max(120),
  commissioneMedia: z.coerce.number().nonnegative().optional(),
});

export type PartnerInput = z.infer<typeof partnerSchema>;
export type PartnerFormInput = z.input<typeof partnerSchema>;

export const STATO_RICHIESTA_PREVENTIVO_OPTIONS = [
  "INVIATA",
  "CONTATTATO",
  "PREVENTIVO_RICEVUTO",
  "CHIUSA_CONVERTITA",
  "CHIUSA_NON_CONVERTITA",
] as const;

/** `stato` arriva tipizzato solo a compile-time: un client che chiama l'azione direttamente
 * (bypassando il form) potrebbe inviare qualunque stringa, quindi va rivalidata a runtime. */
export const aggiornaStatoRichiestaPreventivoSchema = z.object({
  richiestaId: z.string().min(1),
  stato: z.enum(STATO_RICHIESTA_PREVENTIVO_OPTIONS),
});
