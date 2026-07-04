import { prisma } from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const [numeroAgenzie, numeroAmministratori, numeroContratti, contrattiAttivi, pagamentiInRitardo, volumeIncassato, poolDepositi] =
    await Promise.all([
      prisma.agenzia.count(),
      prisma.amministratore.count(),
      prisma.contratto.count(),
      prisma.contratto.count({ where: { stato: "ATTIVO" } }),
      prisma.pagamento.count({ where: { stato: { in: ["IN_RITARDO", "INSOLUTO"] } } }),
      prisma.pagamento.aggregate({ _sum: { importo: true }, where: { stato: "PAGATO" } }),
      prisma.contratto.aggregate({ _sum: { depositoImporto: true }, where: { depositoStato: "VERSATO" } }),
    ]);

  return {
    numeroAgenzie,
    numeroAmministratori,
    numeroContratti,
    contrattiAttivi,
    pagamentiInRitardo,
    volumeIncassato: volumeIncassato._sum.importo ?? 0,
    poolDepositiTotale: poolDepositi._sum.depositoImporto ?? 0,
  };
}

export async function getDistribuzionePagamenti() {
  const [pagato, inRitardo, insoluto] = await Promise.all([
    prisma.pagamento.count({ where: { stato: "PAGATO" } }),
    prisma.pagamento.count({ where: { stato: "IN_RITARDO" } }),
    prisma.pagamento.count({ where: { stato: "INSOLUTO" } }),
  ]);

  return [
    { name: "Pagato", value: pagato },
    { name: "In ritardo", value: inRitardo },
    { name: "Insoluto", value: insoluto },
  ];
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

export async function getAmministratoriConPortfolio() {
  const amministratori = await prisma.amministratore.findMany({
    include: {
      user: true,
      condomini: { select: { id: true, numeroUnita: true } },
    },
    orderBy: { ragioneSociale: "asc" },
  });

  const segnalazioni = await prisma.segnalazione.findMany({
    where: { immobile: { condominioId: { not: null } } },
    select: { immobile: { select: { condominioId: true } } },
  });
  const conteggioPerCondominio = new Map<string, number>();
  for (const s of segnalazioni) {
    const cid = s.immobile.condominioId;
    if (!cid) continue;
    conteggioPerCondominio.set(cid, (conteggioPerCondominio.get(cid) ?? 0) + 1);
  }

  return amministratori.map((a) => ({
    id: a.id,
    ragioneSociale: a.ragioneSociale,
    piva: a.piva,
    email: a.user.email,
    numeroCondomini: a.condomini.length,
    unitaTotali: a.condomini.reduce((sum, c) => sum + c.numeroUnita, 0),
    segnalazioniTotali: a.condomini.reduce((sum, c) => sum + (conteggioPerCondominio.get(c.id) ?? 0), 0),
  }));
}
