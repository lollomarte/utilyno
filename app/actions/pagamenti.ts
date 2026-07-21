"use server";

import { revalidatePath } from "next/cache";
import { addBusinessDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requirePrivato } from "@/lib/auth-helpers";
import { paymentProvider } from "@/lib/services/payment-provider";
import { registraLogAzione } from "@/lib/audit/registraLogAzione";
import { pagaOraSchema, type PagaOraInput } from "@/lib/validations/pagamento";
import { METODO_PAGAMENTO_LABELS } from "@/lib/labels";

/** Giorni lavorativi simulati prima dell'accredito al proprietario ("banca a banca"). */
const GIORNI_LAVORATIVI_ACCREDITO = 2;

export async function pagaOraAction(
  input: PagaOraInput
): Promise<{ success: true; dataAccredito: Date } | { success: false; error: string }> {
  const { privato } = await requirePrivato();

  const parsed = pagaOraSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  const pagamento = await prisma.pagamento.findUnique({
    where: { id: parsed.data.pagamentoId },
    include: { contratto: true },
  });
  if (!pagamento || pagamento.contratto.inquilinoId !== privato.id) {
    return { success: false, error: "Pagamento non trovato" };
  }
  if (pagamento.stato === "PAGATO") {
    return { success: false, error: "Questo pagamento risulta già saldato" };
  }

  const esito = await paymentProvider.initiatePayment({
    pagamentoId: pagamento.id,
    importo: pagamento.importo,
    descrizione: `Canone ${METODO_PAGAMENTO_LABELS[parsed.data.metodo]}`,
  });
  const stato = await paymentProvider.getPaymentStatus(esito.externalPaymentId);
  if (stato !== "COMPLETED") {
    return { success: false, error: "Pagamento non riuscito, riprova" };
  }

  const oggi = new Date();
  const dataAccredito = addBusinessDays(oggi, GIORNI_LAVORATIVI_ACCREDITO);

  await prisma.pagamento.update({
    where: { id: pagamento.id },
    data: {
      stato: "PAGATO",
      dataPagamento: oggi,
      dataAccredito,
      metodoPagamento: METODO_PAGAMENTO_LABELS[parsed.data.metodo],
    },
  });
  await registraLogAzione({
    userId: privato.userId,
    azione: "PAGAMENTO",
    entita: "Pagamento",
    entitaId: pagamento.id,
    note: `${METODO_PAGAMENTO_LABELS[parsed.data.metodo]}, importo ${pagamento.importo}`,
  });

  revalidatePath("/privato");
  revalidatePath(`/privato/${pagamento.contratto.immobileId}`);
  revalidatePath(`/agenzia/contratti/${pagamento.contrattoId}`);

  return { success: true, dataAccredito };
}
