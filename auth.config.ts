import type { NextAuthConfig } from "next-auth";

// Tipo letterale locale (non importato da @prisma/client): auth.config.ts deve
// restare edge-safe perché è l'unico modulo importato da middleware.ts. Un
// import, anche solo di tipo, da @prisma/client trascinerebbe il pacchetto
// nel bundle del middleware e rompe il deploy su Vercel (Edge Runtime).
type Role = "ADMIN" | "AGENZIA" | "PROPRIETARIO" | "INQUILINO";

export const PORTAL_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  AGENZIA: "/agenzia",
  PROPRIETARIO: "/proprietario",
  INQUILINO: "/inquilino",
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
