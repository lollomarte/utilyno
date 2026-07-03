"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireInquilino } from "@/lib/auth-helpers";
import { nuovoTicketSchema, type NuovoTicketInput } from "@/lib/validations/ticket";

export async function creaTicketAction(
  input: NuovoTicketInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { inquilino } = await requireInquilino();

  const parsed = nuovoTicketSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }

  const contratto = await prisma.contratto.findFirst({
    where: { inquilinoId: inquilino.id, stato: "ATTIVO" },
  });

  if (!contratto) {
    return { success: false, error: "Nessun contratto attivo a cui associare la segnalazione" };
  }

  await prisma.ticket.create({
    data: {
      immobileId: contratto.immobileId,
      inquilinoId: inquilino.id,
      titolo: parsed.data.titolo,
      descrizione: parsed.data.descrizione,
      priorita: parsed.data.priorita,
    },
  });

  revalidatePath("/inquilino/ticket");

  return { success: true };
}
