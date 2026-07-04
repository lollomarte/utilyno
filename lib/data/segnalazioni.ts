import { prisma } from "@/lib/prisma";

/** Ogni segnalazione dove l'utente è il creatore o uno dei destinatari (il creatore ha sempre una propria riga destinatario). */
export async function getSegnalazioniPerUser(userId: string) {
  const segnalazioni = await prisma.segnalazione.findMany({
    where: { destinatari: { some: { userId } } },
    include: {
      creatoDa: true,
      immobile: true,
      destinatari: { where: { userId }, select: { letto: true } },
      _count: { select: { risposte: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return segnalazioni.map((s) => ({
    ...s,
    nonLetta: s.destinatari[0]?.letto === false,
  }));
}

export async function getSegnalazioneDetail(segnalazioneId: string, userId: string) {
  const segnalazione = await prisma.segnalazione.findUnique({
    where: { id: segnalazioneId },
    include: {
      creatoDa: true,
      immobile: { include: { condominio: true } },
      destinatari: { include: { user: true }, orderBy: { id: "asc" } },
      risposte: { include: { autore: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!segnalazione) return null;

  const isPartecipante =
    segnalazione.creatoDaUserId === userId || segnalazione.destinatari.some((d) => d.userId === userId);
  if (!isPartecipante) return null;

  return segnalazione;
}

export async function getSegnalazioniNonLette(userId: string) {
  return prisma.segnalazioneDestinatario.count({ where: { userId, letto: false } });
}
