import type { DefaultSession } from "next-auth";

type Role = "ADMIN" | "AGENZIA" | "AMMINISTRATORE" | "PRIVATO";

declare module "next-auth" {
  interface User {
    role: Role;
    nome: string;
    cognome: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      nome: string;
      cognome: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    nome: string;
    cognome: string;
  }
}
