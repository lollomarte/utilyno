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

export async function getTicketForInquilino(inquilinoId: string) {
  return prisma.ticket.findMany({
    where: { inquilinoId },
    include: { immobile: true },
    orderBy: { createdAt: "desc" },
  });
}
