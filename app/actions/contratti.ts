"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { addMonths } from "date-fns";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAgenzia } from "@/lib/auth-helpers";
import { adeRegistrationProvider } from "@/lib/services/ade-registration";
import { nuovoContrattoSchema, type NuovoContrattoInput } from "@/lib/validations/contratto";

function generaPasswordProvvisoria(): string {
  return randomBytes(9).toString("base64url");
}

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

  let inquilinoId = data.inquilinoId;
  let inquilinoTemporaryPassword: string | undefined;

  if (data.inquilinoMode === "nuovo") {
    const existing = await prisma.user.findUnique({ where: { email: data.inquilinoEmail! } });
    if (existing) {
      return {
        success: false,
        error: "Email già registrata",
        fieldErrors: { inquilinoEmail: "Questa email è già associata a un account esistente" },
      };
    }

    inquilinoTemporaryPassword = generaPasswordProvvisoria();
    const passwordHash = await bcrypt.hash(inquilinoTemporaryPassword, 10);
    const nuovoInquilino = await prisma.inquilino.create({
      data: {
        codiceFiscale: data.inquilinoCodiceFiscale!,
        user: {
          create: {
            email: data.inquilinoEmail!,
            passwordHash,
            role: "INQUILINO",
            nome: data.inquilinoNome!,
            cognome: data.inquilinoCognome!,
            telefono: data.inquilinoTelefono || null,
          },
        },
      },
    });
    inquilinoId = nuovoInquilino.id;
  }

  if (!inquilinoId) {
    return { success: false, error: "Inquilino non valido" };
  }

  const inquilino = await prisma.inquilino.findUnique({ where: { id: inquilinoId }, include: { user: true } });
  if (!inquilino) {
    return { success: false, error: "Inquilino non valido" };
  }

  const dataInizio = new Date(data.dataInizio);
  const dataFine = new Date(data.dataFine);

  const contratto = await prisma.contratto.create({
    data: {
      immobileId: data.immobileId,
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

  const numeroRate = Math.min(24, Math.max(1, Math.round((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24 * 30))));
  await prisma.pagamento.createMany({
    data: Array.from({ length: numeroRate }, (_, i) => ({
      contrattoId: contratto.id,
      importo: data.canoneMensile,
      dataScadenza: addMonths(dataInizio, i),
      stato: "PROGRAMMATO" as const,
    })),
  });

  revalidatePath("/agenzia/contratti");

  return {
    success: true,
    contrattoId: contratto.id,
    inquilinoTemporaryPassword,
    inquilinoEmail: inquilinoTemporaryPassword ? inquilino.user.email : undefined,
  };
}
