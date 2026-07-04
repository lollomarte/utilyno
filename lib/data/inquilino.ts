import { prisma } from "@/lib/prisma";

export async function getContrattoAttivoForInquilino(inquilinoId: string) {
  return prisma.contratto.findFirst({
    where: { inquilinoId, stato: "ATTIVO" },
    include: {
      immobile: true,
      agenzia: true,
      pagamenti: { orderBy: { dataScadenza: "asc" } },
      checklist: { orderBy: { dataCompilazione: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUtenzeForImmobile(immobileId: string) {
  return prisma.utenza.findMany({ where: { immobileId }, orderBy: { tipo: "asc" } });
}

export async function getComunicazioniPerInquilino(condominioId: string | null, userId: string) {
  if (!condominioId) return [];
  return prisma.comunicazioneCondominiale.findMany({
    where: { condominioId },
    include: { letture: { where: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}
