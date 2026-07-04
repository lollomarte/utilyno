import { z } from "zod";

export const METODO_PAGAMENTO_OPTIONS = ["BONIFICO", "CARTA"] as const;

export const pagaOraSchema = z.object({
  pagamentoId: z.string().min(1),
  metodo: z.enum(METODO_PAGAMENTO_OPTIONS),
});

export type PagaOraInput = z.infer<typeof pagaOraSchema>;
