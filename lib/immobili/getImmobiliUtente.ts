import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type ImmobileUtente = {
  id: string;
  indirizzo: string;
  comune: string;
  relazione: "PROPRIETARIO" | "INQUILINO";
};

/** Tutti gli immobili collegati a uno User in qualunque veste (Proprietario di alcuni,
 * Inquilino di altri): base per la lista aggregata di /casa. Un utente può comparire in
 * entrambi i gruppi contemporaneamente.
 *
 * Avvolta in `cache()`: sotto /casa/[immobileId] viene chiamata sia dal layout (per lo
 * switcher) sia dalla pagina, e a differenza di `fetch` le query Prisma non vengono deduplicate
 * automaticamente da Next.js nella stessa request — senza cache() sono query separate che, sul
 * pool di connessioni ridotto di questo ambiente (connection_limit=5), possono esaurirlo. */
export const getImmobiliUtente = cache(async function getImmobiliUtente(userId: string): Promise<ImmobileUtente[]> {
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
});

export type ContestoImmobile =
  | { relazione: "PROPRIETARIO"; proprietarioId: string }
  | { relazione: "INQUILINO"; inquilinoId: string };

/** Risolve con quale veste (Proprietario o Inquilino) uno User è legato a UNO specifico
 * immobile: base di /casa/[immobileId], dove la stessa persona può essere proprietaria di un
 * immobile e inquilina di un altro — la relazione va sempre verificata per l'immobile
 * selezionato, mai assunta dal profilo "principale" dell'utente.
 *
 * Avvolta in `cache()` per lo stesso motivo di getImmobiliUtente: sia il layout che la pagina di
 * /casa/[immobileId] la chiamano nella stessa request. */
export const getContestoImmobile = cache(async function getContestoImmobile(
  userId: string,
  immobileId: string
): Promise<ContestoImmobile | null> {
  const [proprietario, inquilino] = await Promise.all([
    prisma.proprietario.findFirst({ where: { userId, immobili: { some: { id: immobileId } } }, select: { id: true } }),
    prisma.inquilino.findFirst({
      where: { userId, contratti: { some: { immobileId, stato: "ATTIVO" } } },
      select: { id: true },
    }),
  ]);
  if (proprietario) return { relazione: "PROPRIETARIO", proprietarioId: proprietario.id };
  if (inquilino) return { relazione: "INQUILINO", inquilinoId: inquilino.id };
  return null;
});
