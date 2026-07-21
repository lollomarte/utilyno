import type { NextAuthConfig } from "next-auth";

// Tipo letterale locale, NON importato da @prisma/client: questo file deve
// restare edge-safe perché è l'unico modulo importato da middleware.ts (Edge
// Runtime). Anche un import di solo tipo da @prisma/client trascinerebbe il
// pacchetto nel bundle del middleware e rompe il deploy su Vercel.
type Role = "ADMIN" | "AGENZIA" | "AMMINISTRATORE" | "PRIVATO";

export const PORTAL_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  AGENZIA: "/agenzia",
  AMMINISTRATORE: "/amministratore",
  PRIVATO: "/privato",
};

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.nome = user.nome;
        token.cognome = user.cognome;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
        session.user.nome = token.nome as string;
        session.user.cognome = token.cognome as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
