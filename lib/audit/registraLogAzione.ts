import { prisma } from "@/lib/prisma";

export type EntitaAudit = "Contratto" | "Pagamento" | "Deposito" | "Documento" | "Immobile";

/**
 * Registra un'azione sensibile (chi, cosa, quando) per Contratto/Pagamento/Deposito/Documento.
 * Deliberatamente "fire and forget" solo nel senso che un fallimento qui non deve mai far
 * fallire l'operazione principale già eseguita: un log mancante è meno grave di un'azione
 * di business bloccata da un problema di logging.
 */
export async function registraLogAzione(input: {
  userId: string;
  azione: string;
  entita: EntitaAudit;
  entitaId: string;
  note?: string;
}): Promise<void> {
  try {
    await prisma.logAzione.create({ data: input });
  } catch (err) {
    console.error("registraLogAzione fallita:", err);
  }
}
