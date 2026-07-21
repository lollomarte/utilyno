"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcolaInteressiLegali } from "@/lib/depositi/calcolaInteressiLegali";
import { registraLogAzione } from "@/lib/audit/registraLogAzione";
import { gestisciRestituzioneDepositoSchema, type GestisciRestituzioneDepositoInput } from "@/lib/validations/deposito";

export async function gestisciRestituzioneDepositoAction(
  input: GestisciRestituzioneDepositoInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Non autorizzato" };

  const parsed = gestisciRestituzioneDepositoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  const contratto = await prisma.contratto.findUnique({
    where: { id: parsed.data.contrattoId },
  });
  if (!contratto) return { success: false, error: "Contratto non trovato" };

  const [agenzia, privato] = await Promise.all([
    prisma.agenzia.findUnique({ where: { userId: session.user.id } }),
    prisma.privato.findUnique({ where: { userId: session.user.id } }),
  ]);
  const autorizzato = agenzia?.id === contratto.agenziaId || privato?.id === contratto.proprietarioId;
  if (!autorizzato) return { success: false, error: "Non autorizzato" };

  // Vincolo lato server: il deposito non può essere gestito finché il contratto è ancora attivo.
  if (contratto.stato === "ATTIVO") {
    return { success: false, error: "Il deposito non può essere restituito finché il contratto è attivo" };
  }
  if (contratto.depositoStato === "NON_VERSATO" || contratto.depositoStato === "RESTITUITO") {
    return { success: false, error: "Il deposito non è in uno stato gestibile" };
  }

  if (parsed.data.esito === "RESTITUITO") {
    const interessi = calcolaInteressiLegali(contratto.depositoImporto, contratto.dataInizio, contratto.dataFine);
    await prisma.contratto.update({
      where: { id: contratto.id },
      data: {
        depositoStato: "RESTITUITO",
        dataRestituzioneDeposito: new Date(),
        interessiLegaliMaturati: interessi,
        depositoNote: null,
      },
    });
  } else {
    await prisma.contratto.update({
      where: { id: contratto.id },
      data: { depositoStato: "IN_CONTESTAZIONE", depositoNote: parsed.data.note },
    });
  }
  await registraLogAzione({
    userId: session.user.id,
    azione: "CAMBIO_STATO_DEPOSITO",
    entita: "Deposito",
    entitaId: contratto.id,
    note: parsed.data.esito === "RESTITUITO" ? "Restituito" : `In contestazione: ${parsed.data.note ?? ""}`,
  });

  revalidatePath(`/agenzia/contratti/${contratto.id}`);
  revalidatePath("/privato");
  revalidatePath(`/privato/${contratto.immobileId}`);

  return { success: true };
}
