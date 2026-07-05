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

export async function getComunicazioniPerInquilino(condominioId: string | null, userId: string) {
  if (!condominioId) return [];
  return prisma.comunicazioneCondominiale.findMany({
    where: { condominioId },
    include: { letture: { where: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}
