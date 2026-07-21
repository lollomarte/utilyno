import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type ImmobileUtente = {
  id: string;
  indirizzo: string;
  comune: string;
  /** Ruolo della relazione ATTIVA più recente su questo immobile: un privato può comparire con
   * ruoli diversi su immobili diversi, e anche con ruoli diversi nel tempo sullo stesso
   * immobile (es. era inquilino, ora ne è uscito) — qui si mostra solo l'ultima. */
  relazione: "PROPRIETARIO" | "INQUILINO";
};

/** Tutti gli immobili collegati a un Privato tramite RelazioneImmobilePrivato con stato ATTIVA,
 * in qualunque veste (proprietario di alcuni, inquilino di altri): base per la lista aggregata
 * di /privato. Un privato può comparire in entrambi i ruoli contemporaneamente.
 *
 * Avvolta in `cache()`: sotto /privato/[immobileId] viene chiamata sia dal layout (per lo
 * switcher) sia dalla pagina, e a differenza di `fetch` le query Prisma non vengono deduplicate
 * automaticamente da Next.js nella stessa request — senza cache() sono query separate che, sul
 * pool di connessioni ridotto di questo ambiente (connection_limit=5), possono esaurirlo. */
export const getImmobiliUtente = cache(async function getImmobiliUtente(userId: string): Promise<ImmobileUtente[]> {
  const privato = await prisma.privato.findUnique({ where: { userId } });
  if (!privato) return [];

  const relazioni = await prisma.relazioneImmobilePrivato.findMany({
    where: { privatoId: privato.id, stato: "ATTIVA" },
    include: { immobile: { select: { id: true, indirizzo: true, comune: true } } },
    orderBy: { updatedAt: "desc" },
  });

  // Un privato non dovrebbe avere più di una relazione ATTIVA sullo stesso immobile, ma se
  // succedesse (es. dati incoerenti) si tiene solo la più recente per card: orderBy desc sopra
  // garantisce che la prima incontrata per ciascun immobileId sia quella giusta.
  const perImmobile = new Map<string, ImmobileUtente>();
  for (const r of relazioni) {
    if (perImmobile.has(r.immobile.id)) continue;
    perImmobile.set(r.immobile.id, {
      id: r.immobile.id,
      indirizzo: r.immobile.indirizzo,
      comune: r.immobile.comune,
      relazione: r.ruolo,
    });
  }

  return Array.from(perImmobile.values()).sort((a, b) => a.indirizzo.localeCompare(b.indirizzo));
});

export type ContestoImmobile = {
  relazione: "PROPRIETARIO" | "INQUILINO";
  /** Id del profilo Privato (non più due tipi diversi di id come Proprietario/Inquilino: con il
   * modello unificato è sempre lo stesso Privato.id, qualunque sia il ruolo della relazione). */
  privatoId: string;
};

/** Risolve con quale ruolo (Proprietario o Inquilino) un Privato è legato a UNO specifico
 * immobile: base di /privato/[immobileId], dove la stessa persona può essere proprietaria di un
 * immobile e inquilina di un altro — la relazione va sempre verificata per l'immobile
 * selezionato, mai assunta genericamente dall'account.
 *
 * Avvolta in `cache()` per lo stesso motivo di getImmobiliUtente: sia il layout che la pagina di
 * /privato/[immobileId] la chiamano nella stessa request. */
export const getContestoImmobile = cache(async function getContestoImmobile(
  userId: string,
  immobileId: string
): Promise<ContestoImmobile | null> {
  const privato = await prisma.privato.findUnique({ where: { userId } });
  if (!privato) return null;

  const relazione = await prisma.relazioneImmobilePrivato.findFirst({
    where: { privatoId: privato.id, immobileId, stato: "ATTIVA" },
    orderBy: { updatedAt: "desc" },
  });
  if (!relazione) return null;

  return { relazione: relazione.ruolo, privatoId: privato.id };
});
