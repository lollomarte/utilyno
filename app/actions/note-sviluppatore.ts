"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nuovaNotaSviluppatoreSchema, type NuovaNotaSviluppatoreInput } from "@/lib/validations/nota-sviluppatore";

const LIST_PATHS = [
  "/admin/note-sviluppatore",
  "/agenzia/note-sviluppatore",
  "/amministratore/note-sviluppatore",
  "/proprietario/note-sviluppatore",
  "/inquilino/note-sviluppatore",
];

function revalidateListe() {
  for (const path of LIST_PATHS) revalidatePath(path);
}

export async function creaNotaSviluppatoreAction(
  input: NuovaNotaSviluppatoreInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sessione non valida" };

  const parsed = nuovaNotaSviluppatoreSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  await prisma.notaSviluppatore.create({
    data: {
      tipo: parsed.data.tipo,
      testo: parsed.data.testo,
      autoreUserId: session.user.id,
    },
  });

  revalidateListe();

  return { success: true };
}

/** Bacheca a memoria universale: chiunque sia autenticato può segnare/riaprire, non solo l'autore. */
export async function toggleNotaSviluppatoreRisoltaAction(
  notaId: string,
  risolta: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sessione non valida" };

  await prisma.notaSviluppatore.update({
    where: { id: notaId },
    data: { risolta },
  });

  revalidateListe();

  return { success: true };
}
