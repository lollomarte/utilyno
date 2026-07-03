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

export async function requireProprietario() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROPRIETARIO") redirect("/login");

  const proprietario = await prisma.proprietario.findUnique({ where: { userId: session.user.id } });
  if (!proprietario) redirect("/non-autorizzato");

  return { session, proprietario };
}

export async function requireInquilino() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INQUILINO") redirect("/login");

  const inquilino = await prisma.inquilino.findUnique({ where: { userId: session.user.id } });
  if (!inquilino) redirect("/non-autorizzato");

  return { session, inquilino };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return { session };
}

const PORTAL_PATH_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  AGENZIA: "/agenzia",
  AMMINISTRATORE: "/amministratore",
  PROPRIETARIO: "/proprietario",
  INQUILINO: "/inquilino",
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
    case "PROPRIETARIO": {
      const proprietario = await prisma.proprietario.findUnique({ where: { userId } });
      return proprietario ? path : null;
    }
    case "INQUILINO": {
      const inquilino = await prisma.inquilino.findUnique({ where: { userId } });
      return inquilino ? path : null;
    }
    default:
      return null;
  }
}
