import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireAgenzia() {
  const session = await auth();
  if (!session?.user || session.user.role !== "AGENZIA") redirect("/login");

  const agenzia = await prisma.agenzia.findUnique({ where: { userId: session.user.id } });
  if (!agenzia) redirect("/non-autorizzato");

  return { session, agenzia };
}

export async function requireAmministratore() {
  const session = await auth();
  if (!session?.user || session.user.role !== "AMMINISTRATORE") redirect("/login");

  const amministratore = await prisma.amministratore.findUnique({ where: { userId: session.user.id } });
  if (!amministratore) redirect("/non-autorizzato");

  return { session, amministratore };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return { session };
}

/** Guard del portale /privato: Proprietario e Inquilino non sono più profili account-level,
 * quindi basta possedere il ruolo PRIVATO — quali RelazioneImmobilePrivato esistano (anche
 * zero) è affare delle singole pagine, non di questo guard. */
export async function requirePrivato() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PRIVATO") redirect("/login");

  const privato = await prisma.privato.findUnique({ where: { userId: session.user.id } });
  if (!privato) redirect("/non-autorizzato");

  return { session, privato };
}

const PORTAL_PATH_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  AGENZIA: "/agenzia",
  AMMINISTRATORE: "/amministratore",
  PRIVATO: "/privato",
};

/**
 * Verifica che l'utente della sessione corrente esista ancora nel database
 * (con il relativo record di ruolo) e restituisce il percorso del suo
 * portale. Ritorna null se la sessione fa riferimento a un utente non più
 * presente nel DB (es. dopo un reset), così le pagine che la chiamano
 * possono offrire un logout invece di rimandare l'utente in loop verso
 * /non-autorizzato.
 */
export async function resolvePortalForSession(
  userId: string,
  role: string
): Promise<string | null> {
  const path = PORTAL_PATH_BY_ROLE[role];
  if (!path) return null;

  switch (role) {
    case "ADMIN": {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return user ? path : null;
    }
    case "AGENZIA": {
      const agenzia = await prisma.agenzia.findUnique({ where: { userId } });
      return agenzia ? path : null;
    }
    case "AMMINISTRATORE": {
      const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
      return amministratore ? path : null;
    }
    case "PRIVATO": {
      const privato = await prisma.privato.findUnique({ where: { userId } });
      return privato ? path : null;
    }
    default:
      return null;
  }
}
