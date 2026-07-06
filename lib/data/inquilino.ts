import { prisma } from "@/lib/prisma";

/**
 * Contratto attivo dell'inquilino; se non ne ha uno (es. contratto concluso),
 * torna il più recente in assoluto così l'inquilino può comunque vedere lo
 * stato del proprio deposito (es. in contestazione) dopo la fine del contratto.
 */
export async function getContrattoAttivoForInquilino(inquilinoId: string) {
  const include = {
    immobile: true,
    agenzia: true,
    pagamenti: { orderBy: { dataScadenza: "asc" as const } },
    checklist: { orderBy: { dataCompilazione: "desc" as const } },
  };

  const attivo = await prisma.contratto.findFirst({
    where: { inquilinoId, stato: "ATTIVO" },
    include,
    orderBy: { createdAt: "desc" },
  });
  if (attivo) return attivo;

  return prisma.contratto.findFirst({
    where: { inquilinoId },
    include,
    orderBy: { dataFine: "desc" },
  });
}

/** Tutti i contratti dell'inquilino (non solo quello attivo): per la scelta del contesto
 * quando carica un documento, così restano collegabili anche documenti di contratti passati. */
export async function getContrattiForInquilino(inquilinoId: string) {
  return prisma.contratto.findMany({
    where: { inquilinoId },
    include: { immobile: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getComunicazioniPerInquilino(condominioId: string | null, userId: string) {
  if (!condominioId) return [];
  return prisma.comunicazioneCondominiale.findMany({
    where: { condominioId },
    include: { letture: { where: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}
