"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAgenzia } from "@/lib/auth-helpers";
import { nuovoImmobileSchema, type NuovoImmobileInput } from "@/lib/validations/immobile";

type ImmobileSummary = { id: string; indirizzo: string; comune: string; provincia: string };

export async function creaImmobileAction(
  input: NuovoImmobileInput
): Promise<
  | { success: true; immobile: ImmobileSummary }
  | { success: false; error: string; fieldErrors?: Record<string, string> }
> {
  const { agenzia } = await requireAgenzia();

  const parsed = nuovoImmobileSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }
  const data = parsed.data;

  let proprietarioId = data.proprietarioId;

  if (data.proprietarioMode === "nuovo") {
    const existing = await prisma.user.findUnique({ where: { email: data.proprietarioEmail! } });
    if (existing) {
      return {
        success: false,
        error: "Email già registrata",
        fieldErrors: { proprietarioEmail: "Questa email è già associata a un account esistente" },
      };
    }

    const passwordHash = await bcrypt.hash(data.proprietarioPassword!, 10);
    const nuovoProprietario = await prisma.proprietario.create({
      data: {
        codiceFiscale: data.proprietarioCodiceFiscale!,
        indirizzo: data.proprietarioIndirizzo!,
        user: {
          create: {
            email: data.proprietarioEmail!,
            passwordHash,
            role: "PROPRIETARIO",
            nome: data.proprietarioNome!,
            cognome: data.proprietarioCognome!,
          },
        },
      },
    });
    proprietarioId = nuovoProprietario.id;
  }

  if (!proprietarioId) {
    return { success: false, error: "Proprietario non valido" };
  }

  const immobile = await prisma.immobile.create({
    data: {
      proprietarioId,
      agenziaId: agenzia.id,
      condominioId: data.condominioId || null,
      indirizzo: data.indirizzo,
      comune: data.comune,
      provincia: data.provincia.toUpperCase(),
      datiCatastali: data.datiCatastali,
      superficieMq: data.superficieMq,
      tipoImmobile: data.tipoImmobile,
      apeClasse: data.apeClasse || null,
      valoreStimato: data.valoreStimato,
    },
  });

  revalidatePath("/agenzia/immobili");

  return {
    success: true,
    immobile: { id: immobile.id, indirizzo: immobile.indirizzo, comune: immobile.comune, provincia: immobile.provincia },
  };
}
