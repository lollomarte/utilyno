import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { isLoginBloccato, registraTentativoLogin } from "@/lib/auth/rateLimitLogin";

/** Un User può avere più profili contemporaneamente (es. Proprietario di un immobile e
 * Inquilino di un altro): calcolato al login dai record 1:1 effettivamente presenti, non
 * dal solo campo `role` (che resta il profilo "primario"/di prima registrazione). */
function calcolaProfili(user: {
  role: Role;
  agenzia: unknown;
  amministratore: unknown;
  proprietario: unknown;
  inquilino: unknown;
}): Role[] {
  const profili: Role[] = [];
  if (user.role === "ADMIN") profili.push("ADMIN");
  if (user.agenzia) profili.push("AGENZIA");
  if (user.amministratore) profili.push("AMMINISTRATORE");
  if (user.proprietario) profili.push("PROPRIETARIO");
  if (user.inquilino) profili.push("INQUILINO");
  return profili;
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Il `code` finisce nell'URL di redirect: niente dettagli, solo l'indicazione del blocco. */
class AccountBloccatoError extends CredentialsSignin {
  code = "account_bloccato";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Controllo persistito su DB (non in memoria): l'app gira su funzioni serverless
        // e un contatore in-process non sopravviverebbe tra istanze/invocazioni diverse.
        if (await isLoginBloccato(email)) {
          throw new AccountBloccatoError();
        }

        // Unico punto dell'app che ha legittimamente bisogno dell'hash: riabilitato
        // esplicitamente qui, mentre resta omesso ovunque altro (vedi lib/prisma.ts).
        const user = await prisma.user.findUnique({
          where: { email },
          omit: { passwordHash: false },
          include: {
            agenzia: { select: { id: true } },
            amministratore: { select: { id: true } },
            proprietario: { select: { id: true } },
            inquilino: { select: { id: true } },
          },
        });
        // Email inesistente conta come tentativo fallito allo stesso modo di una password
        // sbagliata: altrimenti il comportamento del rate limit rivelerebbe se un'email esiste.
        const passwordValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

        await registraTentativoLogin(email, passwordValid);
        if (!user || !passwordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.nome} ${user.cognome}`,
          role: user.role,
          profili: calcolaProfili(user),
          nome: user.nome,
          cognome: user.cognome,
        };
      },
    }),
  ],
});
