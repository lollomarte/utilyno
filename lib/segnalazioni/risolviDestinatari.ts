import { prisma } from "@/lib/prisma";
import type { CategoriaSegnalazione, Role } from "@prisma/client";

/**
 * Ruoli "pertinenti" per ciascuna categoria: chi, tra le parti collegate
 * all'immobile, deve essere avvisato. Il mittente viene sempre escluso
 * a valle, indipendentemente da questa tabella.
 */
const RUOLI_PERTINENTI: Record<CategoriaSegnalazione, Role[]> = {
  PROBLEMA_UNITA: ["PROPRIETARIO", "INQUILINO"],
  PROBLEMA_CONDOMINIALE: ["AMMINISTRATORE", "PROPRIETARIO", "INQUILINO"],
  PROBLEMA_MISTO: ["AMMINISTRATORE", "PROPRIETARIO", "INQUILINO"],
  PROBLEMA_CONTRATTUALE: ["AGENZIA", "PROPRIETARIO"],
};

/** Categoria di fallback quando l'utente non ne sceglie una: comportamento più prudente e minimale. */
const RUOLI_PERTINENTI_DEFAULT: Role[] = ["PROPRIETARIO", "INQUILINO"];

export interface PartePool {
  userId: string;
  ruolo: Role;
  nome: string;
  cognome: string;
}

/**
 * Calcola il "pool" di tutte le parti potenzialmente coinvolte per un
 * immobile: proprietario e agenzia esistono sempre, inquilino solo se
 * c'è un contratto attivo su quell'unità, amministratore solo se
 * l'immobile è collegato a un condominio.
 */
export async function getPoolImmobile(immobileId: string): Promise<PartePool[]> {
  const immobile = await prisma.immobile.findUniqueOrThrow({
    where: { id: immobileId },
    include: {
      proprietario: { include: { user: true } },
      agenzia: { include: { user: true } },
      condominio: { include: { amministratore: { include: { user: true } } } },
      contratti: {
        where: { stato: "ATTIVO" },
        include: { inquilino: { include: { user: true } } },
        take: 1,
      },
    },
  });

  const pool: PartePool[] = [
    {
      userId: immobile.proprietario.user.id,
      ruolo: "PROPRIETARIO",
      nome: immobile.proprietario.user.nome,
      cognome: immobile.proprietario.user.cognome,
    },
  ];

  // Un immobile auto-inserito dal Proprietario (stato BOZZA_PROPRIETARIO) non ha ancora
  // un'agenzia: nessuna segnalazione dovrebbe comunque poter nascere in quel contesto, ma
  // il pool resta corretto anche in quel caso limite.
  if (immobile.agenzia) {
    pool.push({
      userId: immobile.agenzia.user.id,
      ruolo: "AGENZIA",
      nome: immobile.agenzia.user.nome,
      cognome: immobile.agenzia.user.cognome,
    });
  }

  const inquilinoUser = immobile.contratti[0]?.inquilino.user;
  if (inquilinoUser) {
    pool.push({ userId: inquilinoUser.id, ruolo: "INQUILINO", nome: inquilinoUser.nome, cognome: inquilinoUser.cognome });
  }

  const amministratoreUser = immobile.condominio?.amministratore.user;
  if (amministratoreUser) {
    pool.push({
      userId: amministratoreUser.id,
      ruolo: "AMMINISTRATORE",
      nome: amministratoreUser.nome,
      cognome: amministratoreUser.cognome,
    });
  }

  return pool;
}

/**
 * Funzione unica e riutilizzabile per determinare i destinatari automatici
 * di una segnalazione: dato l'immobile, la categoria e chi la sta creando,
 * risale le relazioni già esistenti nei dati (proprietario, inquilino con
 * contratto attivo, agenzia, amministratore del condominio) e restituisce
 * solo le parti pertinenti alla categoria, escludendo sempre il mittente.
 *
 * Se una relazione non esiste per quell'immobile (es. nessun condominio,
 * nessun inquilino attivo) quella parte semplicemente non compare nel
 * pool: nessun errore, il messaggio va comunque a chi esiste.
 */
export async function risolviDestinatari({
  immobileId,
  categoria,
  mittenteUserId,
}: {
  immobileId: string;
  categoria: CategoriaSegnalazione | null;
  mittenteUserId: string;
}): Promise<PartePool[]> {
  const pool = await getPoolImmobile(immobileId);
  const ruoliPertinenti = categoria ? RUOLI_PERTINENTI[categoria] : RUOLI_PERTINENTI_DEFAULT;

  return pool.filter((p) => ruoliPertinenti.includes(p.ruolo) && p.userId !== mittenteUserId);
}

/** Categorie disponibili per un immobile: nasconde quelle che non hanno senso nel contesto (es. condominiale senza condominio). */
export async function getCategorieDisponibili(immobileId: string): Promise<CategoriaSegnalazione[]> {
  const immobile = await prisma.immobile.findUniqueOrThrow({ where: { id: immobileId }, select: { condominioId: true } });

  const categorie: CategoriaSegnalazione[] = ["PROBLEMA_UNITA", "PROBLEMA_MISTO", "PROBLEMA_CONTRATTUALE"];
  if (immobile.condominioId) categorie.splice(1, 0, "PROBLEMA_CONDOMINIALE");
  return categorie;
}
