import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type DatiAnagrafici = {
  email: string;
  nome: string;
  cognome: string;
  telefono?: string | null;
  codiceFiscale: string;
  indirizzo?: string | null;
  /** Se non fornita, ne viene generata una provvisoria (restituita in `passwordProvvisoria`). */
  password?: string;
};

/**
 * Risolve lo userId a cui agganciare una relazione RelazioneImmobilePrivato creata "al volo" da
 * un'agenzia (es. alla creazione di un immobile o di un contratto). Se l'email corrisponde a uno
 * User già esistente — perché la persona ha già un profilo Privato sulla piattaforma, es. è già
 * proprietaria altrove e ora diventa anche inquilina — riusa lo stesso User/Privato invece di
 * bloccare l'operazione o crearne uno duplicato: `email` è unique a livello di schema, quindi due
 * account con la stessa email non sono mai stati possibili.
 *
 * Il Privato creato al volo è sempre PERSONA_FISICA: questi flussi rapidi (form inline
 * dell'agenzia) raccolgono solo nome/cognome/codice fiscale, mai i dati azienda — un'agenzia che
 * gestisce un immobile per conto di una società dovrà completare il profilo separatamente.
 */
export async function risolviUserPerProfiloPrivato(
  dati: DatiAnagrafici
): Promise<{ userId: string; privatoId: string; nuovoUser: boolean; passwordProvvisoria?: string }> {
  const existing = await prisma.user.findUnique({ where: { email: dati.email }, include: { privato: true } });
  if (existing) {
    if (!existing.privato) {
      throw new Error(`L'utente ${dati.email} esiste ma non ha un profilo Privato: incoerenza dati.`);
    }
    return { userId: existing.id, privatoId: existing.privato.id, nuovoUser: false };
  }

  const passwordProvvisoria = dati.password ? undefined : randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(dati.password ?? passwordProvvisoria!, 10);
  const user = await prisma.user.create({
    data: {
      email: dati.email,
      passwordHash,
      role: "PRIVATO",
      nome: dati.nome,
      cognome: dati.cognome,
      telefono: dati.telefono ?? null,
      privato: {
        create: {
          tipoSoggetto: "PERSONA_FISICA",
          codiceFiscale: dati.codiceFiscale,
          indirizzo: dati.indirizzo ?? null,
        },
      },
    },
    include: { privato: true },
  });
  return { userId: user.id, privatoId: user.privato!.id, nuovoUser: true, passwordProvvisoria };
}
