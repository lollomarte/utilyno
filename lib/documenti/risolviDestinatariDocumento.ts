import { prisma } from "@/lib/prisma";
import { getPoolImmobile, type PartePool } from "@/lib/segnalazioni/risolviDestinatari";

export type ContestoDocumento =
  | { tipo: "IMMOBILE"; id: string }
  | { tipo: "CONTRATTO"; id: string }
  | { tipo: "CONDOMINIO"; id: string };

/** Pool per un Contratto specifico: usa l'inquilino di QUEL contratto (non necessariamente
 * quello attivo oggi sull'immobile), utile per documenti storici legati a un contratto concluso. */
async function getPoolContratto(contrattoId: string): Promise<PartePool[]> {
  const contratto = await prisma.contratto.findUniqueOrThrow({
    where: { id: contrattoId },
    include: {
      inquilino: { include: { user: true } },
      immobile: {
        include: {
          proprietario: { include: { user: true } },
          agenzia: { include: { user: true } },
          condominio: { include: { amministratore: { include: { user: true } } } },
        },
      },
    },
  });

  const pool: PartePool[] = [
    {
      userId: contratto.immobile.proprietario.user.id,
      ruolo: "PROPRIETARIO",
      nome: contratto.immobile.proprietario.user.nome,
      cognome: contratto.immobile.proprietario.user.cognome,
    },
    {
      userId: contratto.inquilino.user.id,
      ruolo: "INQUILINO",
      nome: contratto.inquilino.user.nome,
      cognome: contratto.inquilino.user.cognome,
    },
  ];

  // Un Contratto esiste solo su un immobile già in gestione a un'agenzia, ma il campo resta
  // nullable a livello di tipo (immobili auto-inseriti dal Proprietario partono senza agenzia).
  if (contratto.immobile.agenzia) {
    pool.push({
      userId: contratto.immobile.agenzia.user.id,
      ruolo: "AGENZIA",
      nome: contratto.immobile.agenzia.user.nome,
      cognome: contratto.immobile.agenzia.user.cognome,
    });
  }

  const amministratoreUser = contratto.immobile.condominio?.amministratore.user;
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

/** Pool per un intero Condominio: l'amministratore più, senza duplicati, proprietario/agenzia/
 * inquilino attivo di ciascun immobile collegato. Usato per documenti "di palazzo" (es. regolamento
 * condominiale) che l'Amministratore vuole condividere con tutte le parti collegate all'edificio. */
async function getPoolCondominio(condominioId: string): Promise<PartePool[]> {
  const condominio = await prisma.condominio.findUniqueOrThrow({
    where: { id: condominioId },
    include: {
      amministratore: { include: { user: true } },
      immobili: {
        include: {
          proprietario: { include: { user: true } },
          agenzia: { include: { user: true } },
          contratti: { where: { stato: "ATTIVO" }, include: { inquilino: { include: { user: true } } }, take: 1 },
        },
      },
    },
  });

  const pool: PartePool[] = [];
  const visti = new Set<string>();

  function aggiungi(userId: string, ruolo: PartePool["ruolo"], nome: string, cognome: string) {
    if (visti.has(userId)) return;
    visti.add(userId);
    pool.push({ userId, ruolo, nome, cognome });
  }

  aggiungi(
    condominio.amministratore.user.id,
    "AMMINISTRATORE",
    condominio.amministratore.user.nome,
    condominio.amministratore.user.cognome
  );

  for (const immobile of condominio.immobili) {
    aggiungi(
      immobile.proprietario.user.id,
      "PROPRIETARIO",
      immobile.proprietario.user.nome,
      immobile.proprietario.user.cognome
    );
    if (immobile.agenzia) {
      aggiungi(immobile.agenzia.user.id, "AGENZIA", immobile.agenzia.user.nome, immobile.agenzia.user.cognome);
    }
    const inquilinoUser = immobile.contratti[0]?.inquilino.user;
    if (inquilinoUser) aggiungi(inquilinoUser.id, "INQUILINO", inquilinoUser.nome, inquilinoUser.cognome);
  }

  return pool;
}

/**
 * Calcola il pool di condivisione possibile per un documento, in base al contesto scelto
 * dall'utente che lo carica (immobile, contratto o condominio): solo le parti effettivamente
 * collegate a quel contesto, mai un elenco libero di tutti gli utenti della piattaforma.
 * Chi carica il documento viene sempre escluso dal pool restituito, perché il documento gli
 * resta comunque visibile in quanto autore, senza bisogno di una riga di condivisione esplicita.
 */
export async function getPoolContestoDocumento(
  contesto: ContestoDocumento,
  caricatoDaUserId: string
): Promise<PartePool[]> {
  const pool =
    contesto.tipo === "IMMOBILE"
      ? await getPoolImmobile(contesto.id)
      : contesto.tipo === "CONTRATTO"
        ? await getPoolContratto(contesto.id)
        : await getPoolCondominio(contesto.id);

  return pool.filter((p) => p.userId !== caricatoDaUserId);
}
