"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAgenzia, requireAmministratore } from "@/lib/auth-helpers";
import {
  nuovoImmobileSchema,
  collegaImmobileEsistenteSchema,
  creaImmobilePerCondominioSchema,
  type NuovoImmobileInput,
  type CollegaImmobileEsistenteInput,
  type CreaImmobilePerCondominioInput,
} from "@/lib/validations/immobile";

type ImmobileSummary = { id: string; indirizzo: string; comune: string; provincia: string };

/** Risolve il proprietarioId da usare per un nuovo Immobile: crea l'utente al volo se in modalità "nuovo". */
async function risolviProprietario(data: {
  proprietarioMode: "esistente" | "nuovo";
  proprietarioId?: string;
  proprietarioNome?: string;
  proprietarioCognome?: string;
  proprietarioEmail?: string;
  proprietarioCodiceFiscale?: string;
  proprietarioIndirizzo?: string;
  proprietarioPassword?: string;
}): Promise<{ success: true; proprietarioId: string } | { success: false; error: string; fieldErrors?: Record<string, string> }> {
  if (data.proprietarioMode === "esistente") {
    if (!data.proprietarioId) return { success: false, error: "Proprietario non valido" };
    return { success: true, proprietarioId: data.proprietarioId };
  }

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
  return { success: true, proprietarioId: nuovoProprietario.id };
}

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

  const risolto = await risolviProprietario(data);
  if (!risolto.success) return risolto;

  const immobile = await prisma.immobile.create({
    data: {
      proprietarioId: risolto.proprietarioId,
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

export async function collegaImmobileEsistenteAction(
  input: CollegaImmobileEsistenteInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { amministratore } = await requireAmministratore();

  const parsed = collegaImmobileEsistenteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  const condominio = await prisma.condominio.findFirst({
    where: { id: parsed.data.condominioId, amministratoreId: amministratore.id },
  });
  if (!condominio) return { success: false, error: "Condominio non valido" };

  const immobile = await prisma.immobile.findUnique({ where: { id: parsed.data.immobileId } });
  if (!immobile || immobile.condominioId) {
    return { success: false, error: "Immobile non disponibile: potrebbe essere già stato assegnato" };
  }

  await prisma.immobile.update({ where: { id: immobile.id }, data: { condominioId: condominio.id } });

  revalidatePath(`/amministratore/condomini/${condominio.id}`);

  return { success: true };
}

export async function creaImmobilePerCondominioAction(
  input: CreaImmobilePerCondominioInput
): Promise<{ success: true } | { success: false; error: string; fieldErrors?: Record<string, string> }> {
  const { amministratore } = await requireAmministratore();

  const parsed = creaImmobilePerCondominioSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }
  const data = parsed.data;

  const condominio = await prisma.condominio.findFirst({
    where: { id: data.condominioId, amministratoreId: amministratore.id },
  });
  if (!condominio) return { success: false, error: "Condominio non valido" };

  const agenzia = await prisma.agenzia.findUnique({ where: { id: data.agenziaId } });
  if (!agenzia) return { success: false, error: "Agenzia non valida" };

  const risolto = await risolviProprietario(data);
  if (!risolto.success) return risolto;

  await prisma.immobile.create({
    data: {
      proprietarioId: risolto.proprietarioId,
      agenziaId: agenzia.id,
      condominioId: condominio.id,
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

  revalidatePath(`/amministratore/condomini/${condominio.id}`);

  return { success: true };
}
