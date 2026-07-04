import { addDays, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { it } from "date-fns/locale";
import { prisma } from "@/lib/prisma";

export async function getImmobiliForProprietario(proprietarioId: string) {
  return prisma.immobile.findMany({
    where: { proprietarioId },
    include: {
      contratti: {
        where: { stato: "ATTIVO" },
        include: { inquilino: { include: { user: true } } },
      },
      assicurazioni: { orderBy: { dataScadenza: "asc" } },
    },
    orderBy: { indirizzo: "asc" },
  });
}

export async function getDocumentiPerProprietario(proprietarioId: string) {
  return prisma.documento.findMany({
    where: {
      OR: [{ immobile: { proprietarioId } }, { contratto: { immobile: { proprietarioId } } }],
    },
    include: { immobile: true, contratto: { include: { immobile: true } } },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function getProprietarioDashboardStats(proprietarioId: string) {
  const immobili = await getImmobiliForProprietario(proprietarioId);
  const contrattiAttivi = immobili.flatMap((i) => i.contratti);

  const canoneMedio =
    contrattiAttivi.length > 0
      ? contrattiAttivi.reduce((sum, c) => sum + c.canoneMensile, 0) / contrattiAttivi.length
      : 0;

  const immobiliOccupati = immobili.filter((i) => i.contratti.length > 0).length;

  const now = new Date();
  const prossimiIncassi = await prisma.pagamento.findMany({
    where: {
      stato: "PROGRAMMATO",
      dataScadenza: { gte: now, lte: addDays(now, 30) },
      contratto: { immobile: { proprietarioId } },
    },
    include: { contratto: { include: { immobile: true } } },
    orderBy: { dataScadenza: "asc" },
  });

  return {
    numeroImmobili: immobili.length,
    canoneMedio,
    immobiliOccupati,
    prossimiIncassi,
  };
}

export async function getComunicazioniPerProprietario(proprietarioId: string, userId: string) {
  const condomini = await prisma.immobile.findMany({
    where: { proprietarioId, condominioId: { not: null } },
    select: { condominioId: true },
    distinct: ["condominioId"],
  });
  const condominioIds = condomini.map((c) => c.condominioId).filter((id): id is string => !!id);
  if (condominioIds.length === 0) return [];

  return prisma.comunicazioneCondominiale.findMany({
    where: { condominioId: { in: condominioIds } },
    include: { condominio: true, letture: { where: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}

/** Totale incassato (pagamenti PAGATO) mese per mese, ultimi 6 mesi incluso quello corrente. */
export async function getAndamentoIncassiProprietario(proprietarioId: string) {
  const now = new Date();
  const mesi = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));

  return Promise.all(
    mesi.map(async (mese) => {
      const agg = await prisma.pagamento.aggregate({
        _sum: { importo: true },
        where: {
          stato: "PAGATO",
          dataPagamento: { gte: startOfMonth(mese), lte: endOfMonth(mese) },
          contratto: { immobile: { proprietarioId } },
        },
      });
      return { mese: format(mese, "MMM", { locale: it }), importo: agg._sum.importo ?? 0 };
    })
  );
}

export async function getImmobileDetailForProprietario(immobileId: string, proprietarioId: string) {
  return prisma.immobile.findFirst({
    where: { id: immobileId, proprietarioId },
    include: {
      contratti: {
        include: {
          inquilino: { include: { user: true } },
          pagamenti: { orderBy: { dataScadenza: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      assicurazioni: { orderBy: { dataScadenza: "asc" } },
      segnalazioni: {
        include: { creatoDa: true, _count: { select: { risposte: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
