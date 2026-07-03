import { prisma } from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const [numeroAgenzie, numeroContratti, contrattiAttivi, pagamentiInRitardo, volumeIncassato] = await Promise.all([
    prisma.agenzia.count(),
    prisma.contratto.count(),
    prisma.contratto.count({ where: { stato: "ATTIVO" } }),
    prisma.pagamento.count({ where: { stato: { in: ["IN_RITARDO", "INSOLUTO"] } } }),
    prisma.pagamento.aggregate({ _sum: { importo: true }, where: { stato: "PAGATO" } }),
  ]);

  return {
    numeroAgenzie,
    numeroContratti,
    contrattiAttivi,
    pagamentiInRitardo,
    volumeIncassato: volumeIncassato._sum.importo ?? 0,
  };
}

export async function getAgenziaDetailForAdmin(agenziaId: string) {
  return prisma.agenzia.findUnique({
    where: { id: agenziaId },
    include: {
      user: true,
      contratti: {
        include: { immobile: true, inquilino: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAgenzieConPortfolio() {
  const agenzie = await prisma.agenzia.findMany({
    include: {
      user: true,
      _count: { select: { immobili: true, contratti: true } },
      contratti: { where: { stato: "ATTIVO" }, select: { canoneMensile: true } },
    },
    orderBy: { ragioneSociale: "asc" },
  });

  return agenzie.map((agenzia) => ({
    id: agenzia.id,
    ragioneSociale: agenzia.ragioneSociale,
    piva: agenzia.piva,
    email: agenzia.user.email,
    numeroImmobili: agenzia._count.immobili,
    numeroContratti: agenzia._count.contratti,
    canoniMensiliAttivi: agenzia.contratti.reduce((sum, c) => sum + c.canoneMensile, 0),
  }));
}
