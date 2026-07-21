"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * Anonimizzazione GDPR ("diritto alla cancellazione") su richiesta, eseguibile solo da Admin:
 * sostituisce i dati personali diretti con placeholder invece di cancellare la riga, perché
 * l'utente resta referenziato da contratti/pagamenti/log storici che non devono rompersi.
 * L'account anonimizzato non potrà più autenticarsi (email e password sostituite).
 */
export async function anonimizzaAccountAction(userId: string): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "Account non trovato" };
  if (user.anonimizzatoAt) return { success: false, error: "Questo account è già stato anonimizzato" };

  const passwordHashInutilizzabile = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        nome: "Utente",
        cognome: "Anonimizzato",
        email: `anonimizzato-${userId}@loqo.invalid`,
        telefono: null,
        passwordHash: passwordHashInutilizzabile,
        anonimizzatoAt: new Date(),
      },
    });

    const privato = await tx.privato.findUnique({ where: { userId } });
    if (privato) {
      await tx.privato.update({
        where: { userId },
        data: {
          codiceFiscale: privato.codiceFiscale ? `ANON${privato.id}`.slice(0, 16).toUpperCase() : null,
          indirizzo: "-",
          ragioneSociale: privato.ragioneSociale ? "Azienda anonimizzata" : null,
          referenteNome: privato.referenteNome ? "Anonimizzato" : null,
        },
      });
    }
  });

  revalidatePath("/admin/agenzie");
  revalidatePath("/admin/amministratori");

  return { success: true };
}
