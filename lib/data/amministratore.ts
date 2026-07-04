import { prisma } from "@/lib/prisma";

export async function getAmministratoreDashboardStats(amministratoreId: string, userId: string) {
  const [numeroCondomini, condomini, segnalazioniAperte] = await Promise.all([
    prisma.condominio.count({ where: { amministratoreId } }),
    prisma.condominio.findMany({ where: { amministratoreId }, select: { numeroUnita: true } }),
    prisma.segnalazioneDestinatario.count({
      where: { userId, segnalazione: { stato: { in: ["APERTA", "IN_LAVORAZIONE"] } } },
    }),
  ]);

  const unitaTotali = condomini.reduce((sum, c) => sum + c.numeroUnita, 0);

  return { numeroCondomini, unitaTotali, segnalazioniAperte };
}

export async function getCondominiForAmministratore(amministratoreId: string) {
  const condomini = await prisma.condominio.findMany({
    where: { amministratoreId },
    include: { _count: { select: { immobili: true } } },
    orderBy: { nome: "asc" },
  });

  const segnalazioni = await prisma.segnalazione.findMany({
    where: { immobile: { condominioId: { in: condomini.map((c) => c.id) } } },
    select: { immobile: { select: { condominioId: true } } },
  });
  const conteggioPerCondominio = new Map<string, number>();
  for (const s of segnalazioni) {
    const cid = s.immobile.condominioId;
    if (!cid) continue;
    conteggioPerCondominio.set(cid, (conteggioPerCondominio.get(cid) ?? 0) + 1);
  }

  return condomini.map((c) => ({
    ...c,
    _count: { ...c._count, segnalazioni: conteggioPerCondominio.get(c.id) ?? 0 },
  }));
}

export async function getCondominioDetail(condominioId: string, amministratoreId: string) {
  return prisma.condominio.findFirst({
    where: { id: condominioId, amministratoreId },
    include: {
      immobili: {
        include: {
          proprietario: { include: { user: true } },
          contratti: { where: { stato: "ATTIVO" }, include: { inquilino: { include: { user: true } } } },
        },
      },
    },
  });
}

export async function getSegnalazioniPerCondominio(condominioId: string) {
  return prisma.segnalazione.findMany({
    where: { immobile: { condominioId } },
    include: { creatoDa: true, immobile: true, _count: { select: { risposte: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getComunicazioniForCondominio(condominioId: string, amministratoreId: string) {
  const condominio = await prisma.condominio.findFirst({ where: { id: condominioId, amministratoreId } });
  if (!condominio) return [];

  return prisma.comunicazioneCondominiale.findMany({
    where: { condominioId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getImmobiliPerSegnalazione(amministratoreId: string) {
  return prisma.immobile.findMany({
    where: { condominio: { amministratoreId } },
    select: {
      id: true,
      indirizzo: true,
      comune: true,
      condominioId: true,
      contratti: { where: { stato: "ATTIVO" }, select: { id: true } },
    },
    orderBy: { indirizzo: "asc" },
  });
}
