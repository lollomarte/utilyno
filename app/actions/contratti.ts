"use server";

import { revalidatePath } from "next/cache";
import { addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAgenzia } from "@/lib/auth-helpers";
import { adeRegistrationProvider } from "@/lib/services/ade-registration";
import { registraLogAzione } from "@/lib/audit/registraLogAzione";
import { risolviUserPerProfiloPrivato } from "@/lib/utenti/risolviUserPerProfiloPrivato";
import { getRelazioneProprietarioAttiva, assicuraRelazioneAttiva } from "@/lib/immobili/relazioni";
import { nuovoContrattoSchema, type NuovoContrattoInput } from "@/lib/validations/contratto";

export async function registraContrattoAdEAction(
  contrattoId: string
): Promise<{ success: true; protocollo: string } | { success: false; error: string }> {
  const { agenzia } = await requireAgenzia();

  const contratto = await prisma.contratto.findFirst({ where: { id: contrattoId, agenziaId: agenzia.id } });
  if (!contratto) {
    return { success: false, error: "Contratto non trovato" };
  }

  const result = await adeRegistrationProvider.registerContract({
    contrattoId: contratto.id,
    canoneMensile: contratto.canoneMensile,
    dataInizio: contratto.dataInizio,
    dataFine: contratto.dataFine,
  });

  await prisma.contratto.update({
    where: { id: contratto.id },
    data: { dataRegistrazioneAdE: result.dataRegistrazione },
  });
  await registraLogAzione({
    userId: agenzia.userId,
    azione: "REGISTRAZIONE_ADE",
    entita: "Contratto",
    entitaId: contratto.id,
    note: `Protocollo ${result.protocollo}`,
  });

  revalidatePath(`/agenzia/contratti/${contrattoId}`);

  return { success: true, protocollo: result.protocollo };
}

export async function rinnovaRegistrazioneAction(
  contrattoId: string
): Promise<{ success: true; protocolloRinnovo: string } | { success: false; error: string }> {
  const { agenzia } = await requireAgenzia();

  const contratto = await prisma.contratto.findFirst({ where: { id: contrattoId, agenziaId: agenzia.id } });
  if (!contratto) {
    return { success: false, error: "Contratto non trovato" };
  }
  if (!contratto.dataRegistrazioneAdE) {
    return { success: false, error: "Il contratto non risulta ancora registrato" };
  }

  const result = await adeRegistrationProvider.renewRegistration({ contrattoId: contratto.id });

  await prisma.contratto.update({
    where: { id: contratto.id },
    data: { dataUltimoRinnovoRegistrazione: result.dataRinnovo },
  });
  await registraLogAzione({
    userId: agenzia.userId,
    azione: "RINNOVO_REGISTRAZIONE_ADE",
    entita: "Contratto",
    entitaId: contratto.id,
    note: `Protocollo rinnovo ${result.protocolloRinnovo}`,
  });

  revalidatePath(`/agenzia/contratti/${contrattoId}`);

  return { success: true, protocolloRinnovo: result.protocolloRinnovo };
}

export async function creaContrattoAction(
  input: NuovoContrattoInput
): Promise<
  | { success: true; contrattoId: string; inquilinoTemporaryPassword?: string; inquilinoEmail?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> }
> {
  const { agenzia } = await requireAgenzia();

  const parsed = nuovoContrattoSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }
  const data = parsed.data;

  const immobile = await prisma.immobile.findFirst({ where: { id: data.immobileId, agenziaId: agenzia.id } });
  if (!immobile) {
    return { success: false, error: "Immobile non valido" };
  }

  const relazioneProprietario = await getRelazioneProprietarioAttiva(immobile.id);
  if (!relazioneProprietario) {
    return { success: false, error: "Nessun proprietario attivo trovato per questo immobile" };
  }

  let inquilinoId = data.inquilinoId;
  let inquilinoTemporaryPassword: string | undefined;

  if (data.inquilinoMode === "nuovo") {
    const { privatoId, nuovoUser, passwordProvvisoria } = await risolviUserPerProfiloPrivato({
      email: data.inquilinoEmail!,
      nome: data.inquilinoNome!,
      cognome: data.inquilinoCognome!,
      telefono: data.inquilinoTelefono || null,
      codiceFiscale: data.inquilinoCodiceFiscale!,
    });
    inquilinoId = privatoId;
    // Credenziali provvisorie solo se è stato creato un account nuovo: chi aveva già un
    // account (nuovoUser === false) continua a usare la propria password esistente.
    inquilinoTemporaryPassword = nuovoUser ? passwordProvvisoria : undefined;
  }

  if (!inquilinoId) {
    return { success: false, error: "Inquilino non valido" };
  }

  const inquilino = await prisma.privato.findUnique({ where: { id: inquilinoId }, include: { user: true } });
  if (!inquilino) {
    return { success: false, error: "Inquilino non valido" };
  }

  const dataInizio = new Date(data.dataInizio);
  const dataFine = new Date(data.dataFine);

  const contratto = await prisma.contratto.create({
    data: {
      immobileId: data.immobileId,
      proprietarioId: relazioneProprietario.privatoId,
      inquilinoId,
      agenziaId: agenzia.id,
      tipoContratto: data.tipoContratto,
      dataInizio,
      dataFine,
      canoneMensile: data.canoneMensile,
      regimeFiscale: data.regimeFiscale,
      stato: "ATTIVO",
      depositoImporto: data.depositoImporto,
      depositoStato: "NON_VERSATO",
    },
  });

  // La relazione PROPRIETARIO esiste già (relazioneProprietario), ma la si allinea comunque a
  // questo contratto; quella INQUILINO nasce qui per la prima volta.
  await Promise.all([
    assicuraRelazioneAttiva({
      privatoId: relazioneProprietario.privatoId,
      immobileId: data.immobileId,
      ruolo: "PROPRIETARIO",
      contrattoId: contratto.id,
    }),
    assicuraRelazioneAttiva({
      privatoId: inquilinoId,
      immobileId: data.immobileId,
      ruolo: "INQUILINO",
      contrattoId: contratto.id,
    }),
  ]);

  const numeroRate = Math.min(24, Math.max(1, Math.round((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24 * 30))));
  await prisma.pagamento.createMany({
    data: Array.from({ length: numeroRate }, (_, i) => ({
      contrattoId: contratto.id,
      importo: data.canoneMensile,
      dataScadenza: addMonths(dataInizio, i),
      stato: "PROGRAMMATO" as const,
    })),
  });

  await registraLogAzione({
    userId: agenzia.userId,
    azione: "CREAZIONE",
    entita: "Contratto",
    entitaId: contratto.id,
  });

  revalidatePath("/agenzia/contratti");

  return {
    success: true,
    contrattoId: contratto.id,
    inquilinoTemporaryPassword,
    inquilinoEmail: inquilinoTemporaryPassword ? inquilino.user.email : undefined,
  };
}
