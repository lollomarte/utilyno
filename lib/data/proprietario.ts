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

export async function getSegnalazioniPerProprietario(proprietarioId: string) {
  return prisma.segnalazioneCondominiale.findMany({
    where: { notificaProprietario: true, immobile: { proprietarioId } },
    include: { immobile: true },
    orderBy: { createdAt: "desc" },
  });
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
