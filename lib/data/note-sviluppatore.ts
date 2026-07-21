import { prisma } from "@/lib/prisma";

/** Bacheca unica: nessuno scoping per utente/immobile/ruolo, tutti leggono tutte le note. */
export async function getNoteSviluppatore() {
  return prisma.notaSviluppatore.findMany({
    include: { autore: true },
    orderBy: { createdAt: "desc" },
  });
}
