import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { isLoginBloccato, registraTentativoLogin } from "@/lib/auth/rateLimitLogin";

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
          nome: user.nome,
          cognome: user.cognome,
        };
      },
    }),
  ],
});
