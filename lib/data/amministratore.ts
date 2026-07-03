import { prisma } from "@/lib/prisma";

export async function getAmministratoreDashboardStats(amministratoreId: string) {
  const [numeroCondomini, condomini, segnalazioniAperte] = await Promise.all([
    prisma.condominio.count({ where: { amministratoreId } }),
    prisma.condominio.findMany({ where: { amministratoreId }, select: { numeroUnita: true } }),
    prisma.segnalazioneCondominiale.count({
      where: { amministratoreId, stato: { in: ["APERTA", "IN_LAVORAZIONE"] } },
    }),
  ]);

  const unitaTotali = condomini.reduce((sum, c) => sum + c.numeroUnita, 0);

  return { numeroCondomini, unitaTotali, segnalazioniAperte };
}

export async function getCondominiForAmministratore(amministratoreId: string) {
  return prisma.condominio.findMany({
    where: { amministratoreId },
    include: { _count: { select: { immobili: true, segnalazioni: true } } },
    orderBy: { nome: "asc" },
  });
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
      segnalazioni: { include: { immobile: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getSegnalazioniForAmministratore(amministratoreId: string) {
  return prisma.segnalazioneCondominiale.findMany({
    where: { amministratoreId },
    include: { condominio: true, immobile: true },
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
      condominioId: true,
      contratti: { where: { stato: "ATTIVO" }, select: { id: true } },
    },
    orderBy: { indirizzo: "asc" },
  });
}
