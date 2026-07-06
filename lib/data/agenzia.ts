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

export async function getImmobileDetailForAgenzia(immobileId: string, agenziaId: string) {
  return prisma.immobile.findFirst({
    where: { id: immobileId, agenziaId },
    include: {
      proprietario: { include: { user: true } },
      condominio: true,
      contratti: {
        include: { inquilino: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      },
      assicurazioni: { orderBy: { dataScadenza: "asc" } },
    },
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

/** Ricerca agenzie già registrate per ragione sociale o email, per la richiesta di gestione
 * immobile del Proprietario: mai un elenco libero, solo un risultato mirato per query. */
export async function cercaAgenzie(query: string) {
  const termine = query.trim();
  if (!termine) return [];

  return prisma.agenzia.findMany({
    where: {
      OR: [
        { ragioneSociale: { contains: termine, mode: "insensitive" } },
        { user: { email: { contains: termine, mode: "insensitive" } } },
      ],
    },
    include: { user: true },
    orderBy: { ragioneSociale: "asc" },
    take: 10,
  });
}

/** Richieste di gestione immobile ricevute dall'agenzia (tutti gli stati), più recenti prima. */
export async function getRichiesteGestionePerAgenzia(agenziaId: string) {
  return prisma.richiestaGestioneImmobile.findMany({
    where: { agenziaId },
    include: {
      immobile: true,
      proprietario: { include: { user: true } },
    },
    orderBy: { dataRichiesta: "desc" },
  });
}

/** Totale incassato (pagamenti PAGATO) mese per mese, ultimi 6 mesi incluso quello corrente.
 * Una sola query per l'intera finestra (non 6 in parallelo, che sotto il limite di
 * connessioni del pool si accodavano invece di essere davvero concorrenti). */
export async function getAndamentoIncassiAgenzia(agenziaId: string) {
  const now = new Date();
  const mesi = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));

  const pagamenti = await prisma.pagamento.findMany({
    where: {
      stato: "PAGATO",
      dataPagamento: { gte: startOfMonth(mesi[0]), lte: endOfMonth(mesi[mesi.length - 1]) },
      contratto: { agenziaId },
    },
    select: { dataPagamento: true, importo: true },
  });

  return mesi.map((mese) => {
    const inizio = startOfMonth(mese).getTime();
    const fine = endOfMonth(mese).getTime();
    const importo = pagamenti
      .filter((p) => p.dataPagamento && p.dataPagamento.getTime() >= inizio && p.dataPagamento.getTime() <= fine)
      .reduce((sum, p) => sum + p.importo, 0);
    return { mese: format(mese, "MMM", { locale: it }), importo };
  });
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
