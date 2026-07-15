import { prisma } from "@/lib/prisma";

export type ImmobileUtente = {
  id: string;
  indirizzo: string;
  comune: string;
  relazione: "PROPRIETARIO" | "INQUILINO";
};

/** Tutti gli immobili collegati a uno User in qualunque veste (Proprietario di alcuni,
 * Inquilino di altri): base per la lista aggregata di /casa. Un utente può comparire in
 * entrambi i gruppi contemporaneamente. */
export async function getImmobiliUtente(userId: string): Promise<ImmobileUtente[]> {
  const [proprietario, inquilino] = await Promise.all([
    prisma.proprietario.findUnique({
      where: { userId },
      include: { immobili: { select: { id: true, indirizzo: true, comune: true }, orderBy: { indirizzo: "asc" } } },
    }),
    prisma.inquilino.findUnique({
      where: { userId },
      include: {
        contratti: {
          where: { stato: "ATTIVO" },
          select: { immobile: { select: { id: true, indirizzo: true, comune: true } } },
          orderBy: { immobile: { indirizzo: "asc" } },
        },
      },
    }),
  ]);

  const daProprietario: ImmobileUtente[] = (proprietario?.immobili ?? []).map((i) => ({
    id: i.id,
    indirizzo: i.indirizzo,
    comune: i.comune,
    relazione: "PROPRIETARIO" as const,
  }));

  const daInquilino: ImmobileUtente[] = (inquilino?.contratti ?? []).map((c) => ({
    id: c.immobile.id,
    indirizzo: c.immobile.indirizzo,
    comune: c.immobile.comune,
    relazione: "INQUILINO" as const,
  }));

  return [...daProprietario, ...daInquilino];
}
