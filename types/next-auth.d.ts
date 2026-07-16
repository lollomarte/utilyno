import type { DefaultSession } from "next-auth";

type Role = "ADMIN" | "AGENZIA" | "AMMINISTRATORE" | "PROPRIETARIO" | "INQUILINO" | "PRIVATO";

declare module "next-auth" {
  interface User {
    role: Role;
    /** Tutti i profili posseduti da questo User (es. può avere sia PROPRIETARIO che INQUILINO
     * contemporaneamente). `role` resta il profilo "primario"/di prima registrazione, usato solo
     * per redirect di default; per i controlli di accesso va sempre usato `profili`. */
    profili: Role[];
    nome: string;
    cognome: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      profili: Role[];
      nome: string;
      cognome: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    profili: Role[];
    nome: string;
    cognome: string;
  }
}
