import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DatiAnagrafici = {
  email: string;
  nome: string;
  cognome: string;
  telefono?: string | null;
  /** Se non fornita, ne viene generata una provvisoria (restituita in `passwordProvvisoria`). */
  password?: string;
};

/**
 * Risolve lo userId a cui agganciare un nuovo profilo Proprietario o Inquilino creato "al volo"
 * da un'agenzia (es. alla creazione di un immobile o di un contratto). Se l'email corrisponde a
 * uno User già esistente — perché la persona ha già un altro profilo sulla piattaforma, es. è
 * già Proprietario e ora diventa anche Inquilino altrove — riusa lo stesso User invece di
 * bloccare l'operazione o crearne uno duplicato: `email` è unique a livello di schema, quindi
 * due account con la stessa email non sono mai stati possibili.
 */
export async function risolviUserPerProfiloPrivato(
  dati: DatiAnagrafici,
  ruoloPrimarioSeNuovo: Extract<Role, "PROPRIETARIO" | "INQUILINO">
): Promise<{ userId: string; nuovoUser: boolean; passwordProvvisoria?: string }> {
  const existing = await prisma.user.findUnique({ where: { email: dati.email } });
  if (existing) {
    return { userId: existing.id, nuovoUser: false };
  }

  const passwordProvvisoria = dati.password ? undefined : randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(dati.password ?? passwordProvvisoria!, 10);
  const user = await prisma.user.create({
    data: {
      email: dati.email,
      passwordHash,
      role: ruoloPrimarioSeNuovo,
      nome: dati.nome,
      cognome: dati.cognome,
      telefono: dati.telefono ?? null,
    },
  });
  return { userId: user.id, nuovoUser: true, passwordProvvisoria };
}
