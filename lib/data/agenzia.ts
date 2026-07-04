import { addDays, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { it } from "date-fns/locale";
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
  const in90Giorni = addDays(now, 90);

  const [contrattiAttivi, incassiMese, contrattiInScadenza, pagamentiInRitardo, leadReListing] = await Promise.all([
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
    prisma.contratto.count({
      where: { agenziaId, stato: "ATTIVO", dataFine: { gte: now, lte: in90Giorni } },
    }),
  ]);

  return {
    contrattiAttivi,
    canoniIncassatiMese: incassiMese._sum.importo ?? 0,
    contrattiInScadenza,
    pagamentiInRitardo,
    leadReListing,
  };
}

export async function getPagamentiInRitardoPerAgenzia(agenziaId: string) {
  return prisma.pagamento.findMany({
    where: {
      stato: { in: ["IN_RITARDO", "INSOLUTO"] },
      contratto: { agenziaId },
    },
    include: { contratto: { include: { immobile: true, inquilino: { include: { user: true } } } } },
    orderBy: { dataScadenza: "asc" },
  });
}

export async function getContrattiInScadenza(agenziaId: string, entroGiorni: number) {
  const now = new Date();
  return prisma.contratto.findMany({
    where: { agenziaId, stato: "ATTIVO", dataFine: { gte: now, lte: addDays(now, entroGiorni) } },
    include: {
      immobile: { include: { proprietario: { include: { user: true } } } },
      inquilino: { include: { user: true } },
    },
    orderBy: { dataFine: "asc" },
  });
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
      checklist: { orderBy: { dataCompilazione: "desc" } },
    },
  });
}

export async function getImmobiliForAgenzia(agenziaId: string) {
  return prisma.immobile.findMany({
    where: { agenziaId },
    include: { proprietario: { include: { user: true } }, condominio: true },
    orderBy: { indirizzo: "asc" },
  });
}

export async function getInquiliniDisponibili() {
  return prisma.inquilino.findMany({
    include: { user: true },
    orderBy: { user: { cognome: "asc" } },
  });
}

export async function getProprietariDisponibili() {
  return prisma.proprietario.findMany({
    include: { user: true },
    orderBy: { user: { cognome: "asc" } },
  });
}

export async function getCondominiDisponibili() {
  return prisma.condominio.findMany({
    orderBy: { nome: "asc" },
  });
}

/** Totale incassato (pagamenti PAGATO) mese per mese, ultimi 6 mesi incluso quello corrente. */
export async function getAndamentoIncassiAgenzia(agenziaId: string) {
  const now = new Date();
  const mesi = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));

  return Promise.all(
    mesi.map(async (mese) => {
      const agg = await prisma.pagamento.aggregate({
        _sum: { importo: true },
        where: {
          stato: "PAGATO",
          dataPagamento: { gte: startOfMonth(mese), lte: endOfMonth(mese) },
          contratto: { agenziaId },
        },
      });
      return { mese: format(mese, "MMM", { locale: it }), importo: agg._sum.importo ?? 0 };
    })
  );
}

export async function getDistribuzionePagamentiAgenzia(agenziaId: string) {
  const [pagato, inRitardo, insoluto] = await Promise.all([
    prisma.pagamento.count({ where: { stato: "PAGATO", contratto: { agenziaId } } }),
    prisma.pagamento.count({ where: { stato: "IN_RITARDO", contratto: { agenziaId } } }),
    prisma.pagamento.count({ where: { stato: "INSOLUTO", contratto: { agenziaId } } }),
  ]);

  return [
    { name: "Pagato", value: pagato },
    { name: "In ritardo", value: inRitardo },
    { name: "Insoluto", value: insoluto },
  ];
}
