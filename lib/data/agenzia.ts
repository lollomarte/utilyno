import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { StatoContratto } from "@prisma/client";

export async function getAgenziaByUserId(userId: string) {
  return prisma.agenzia.findUnique({ where: { userId } });
}

export async function getAgenziaDashboardStats(agenziaId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const in60Giorni = addDays(now, 60);

  const [contrattiAttivi, incassiMese, contrattiInScadenza, pagamentiInRitardo] = await Promise.all([
    prisma.contratto.count({ where: { agenziaId, stato: "ATTIVO" } }),
    prisma.pagamento.aggregate({
      _sum: { importo: true },
      where: {
        stato: "PAGATO",
        dataPagamento: { gte: startOfMonth, lte: endOfMonth },
        contratto: { agenziaId },
      },
    }),
    prisma.contratto.count({
      where: { agenziaId, stato: "ATTIVO", dataFine: { gte: now, lte: in60Giorni } },
    }),
    prisma.pagamento.count({
      where: { stato: { in: ["IN_RITARDO", "INSOLUTO"] }, contratto: { agenziaId } },
    }),
  ]);

  return {
    contrattiAttivi,
    canoniIncassatiMese: incassiMese._sum.importo ?? 0,
    contrattiInScadenza,
    pagamentiInRitardo,
  };
}

export async function getContrattiForAgenzia(
  agenziaId: string,
  filters: { stato?: StatoContratto; immobileId?: string; inquilinoId?: string } = {}
) {
  return prisma.contratto.findMany({
    where: {
      agenziaId,
      ...(filters.stato && { stato: filters.stato }),
      ...(filters.immobileId && { immobileId: filters.immobileId }),
      ...(filters.inquilinoId && { inquilinoId: filters.inquilinoId }),
    },
    include: {
      immobile: true,
      inquilino: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContrattoDetail(contrattoId: string, agenziaId: string) {
  return prisma.contratto.findFirst({
    where: { id: contrattoId, agenziaId },
    include: {
      immobile: { include: { proprietario: { include: { user: true } } } },
      inquilino: { include: { user: true } },
      pagamenti: { orderBy: { dataScadenza: "asc" } },
      documenti: { orderBy: { uploadedAt: "desc" } },
    },
  });
}

export async function getImmobiliForAgenzia(agenziaId: string) {
  return prisma.immobile.findMany({
    where: { agenziaId },
    orderBy: { indirizzo: "asc" },
  });
}

export async function getInquiliniDisponibili() {
  return prisma.inquilino.findMany({
    include: { user: true },
    orderBy: { user: { cognome: "asc" } },
  });
}
