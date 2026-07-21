import { prisma } from "@/lib/prisma";
import type { CategoriaSegnalazione, Role } from "@prisma/client";

/** Ruoli possibili in un pool di destinatari: unione tra i ruoli-immobile (per-relazione, ora su
 * RelazioneImmobilePrivato) e i ruoli-account che restano fissi (Agenzia, Amministratore). Non è
 * più un sottoinsieme dell'enum Prisma `Role`, che da questa versione non contiene più
 * PROPRIETARIO/INQUILINO (vive solo su RelazioneImmobilePrivato). */
export type RuoloPool = "PROPRIETARIO" | "INQUILINO" | "AGENZIA" | "AMMINISTRATORE";

/** Converte un RuoloPool nel Role account-level corrispondente: serve solo dove un campo deve
 * restare tipizzato Role (es. DocumentoCondivisione.ruolo, denormalizzato al momento della
 * condivisione) — PROPRIETARIO e INQUILINO non sono più valori validi di Role, quindi entrambi
 * diventano PRIVATO, perdendo qui la distinzione più fine (che resta invece intatta ovunque si
 * legga RuoloPool direttamente, es. nei destinatari di una Segnalazione). */
export function ruoloPoolToRole(ruolo: RuoloPool): Role {
  if (ruolo === "PROPRIETARIO" || ruolo === "INQUILINO") return "PRIVATO";
  return ruolo;
}

/**
 * Ruoli "pertinenti" per ciascuna categoria: chi, tra le parti collegate
 * all'immobile, deve essere avvisato. Il mittente viene sempre escluso
 * a valle, indipendentemente da questa tabella.
 */
const RUOLI_PERTINENTI: Record<CategoriaSegnalazione, RuoloPool[]> = {
  PROBLEMA_UNITA: ["PROPRIETARIO", "INQUILINO"],
  PROBLEMA_CONDOMINIALE: ["AMMINISTRATORE", "PROPRIETARIO", "INQUILINO"],
  PROBLEMA_MISTO: ["AMMINISTRATORE", "PROPRIETARIO", "INQUILINO"],
  PROBLEMA_CONTRATTUALE: ["AGENZIA", "PROPRIETARIO"],
};

/** Categoria di fallback quando l'utente non ne sceglie una: comportamento più prudente e minimale. */
const RUOLI_PERTINENTI_DEFAULT: RuoloPool[] = ["PROPRIETARIO", "INQUILINO"];

export interface PartePool {
  userId: string;
  ruolo: RuoloPool;
  nome: string;
  cognome: string;
}

/**
 * Calcola il "pool" di tutte le parti potenzialmente coinvolte per un immobile: proprietario/i e
 * inquilino/i vengono dalle RelazioneImmobilePrivato con stato ATTIVA (un immobile può avere più
 * proprietari o più inquilini attivi contemporaneamente — es. comproprietà — quindi il pool ne
 * include quanti ce ne sono, non uno solo), agenzia esiste sempre se l'immobile è in gestione,
 * amministratore solo se l'immobile è collegato a un condominio.
 */
export async function getPoolImmobile(immobileId: string): Promise<PartePool[]> {
  const immobile = await prisma.immobile.findUniqueOrThrow({
    where: { id: immobileId },
    include: {
      agenzia: { include: { user: true } },
      condominio: { include: { amministratore: { include: { user: true } } } },
      relazioni: {
        where: { stato: "ATTIVA" },
        include: { privato: { include: { user: true } } },
      },
    },
  });

  const pool: PartePool[] = immobile.relazioni.map((r) => ({
    userId: r.privato.user.id,
    ruolo: r.ruolo,
    nome: r.privato.user.nome,
    cognome: r.privato.user.cognome,
  }));

  // Un immobile auto-inserito da un privato (stato BOZZA_PROPRIETARIO) non ha ancora
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
 * risale le relazioni già esistenti nei dati (proprietario/i e inquilino/i
 * attivi, agenzia, amministratore del condominio) e restituisce
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
