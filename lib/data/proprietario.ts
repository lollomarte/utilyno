import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getImmobiliForProprietario(proprietarioId: string) {
  return prisma.immobile.findMany({
    where: { proprietarioId },
    include: {
      contratti: {
        where: { stato: "ATTIVO" },
        include: { inquilino: { include: { user: true } } },
      },
    },
    orderBy: { indirizzo: "asc" },
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
      ticket: { orderBy: { createdAt: "desc" } },
    },
  });
}
