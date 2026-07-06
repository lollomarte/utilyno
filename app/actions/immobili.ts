"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAgenzia, requireAmministratore, requireProprietario } from "@/lib/auth-helpers";
import { cercaAgenzie } from "@/lib/data/agenzia";
import { registraLogAzione } from "@/lib/audit/registraLogAzione";
import {
  nuovoImmobileSchema,
  collegaImmobileEsistenteSchema,
  creaImmobilePerCondominioSchema,
  nuovoImmobileProprietarioSchema,
  richiediGestioneImmobileSchema,
  rispondiRichiestaGestioneSchema,
  type NuovoImmobileInput,
  type CollegaImmobileEsistenteInput,
  type CreaImmobilePerCondominioInput,
  type NuovoImmobileProprietarioInput,
  type RichiediGestioneImmobileInput,
  type RispondiRichiestaGestioneInput,
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
      stato: "ATTIVO",
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
      stato: "ATTIVO",
    },
  });

  revalidatePath(`/amministratore/condomini/${condominio.id}`);

  return { success: true };
}

/**
 * Crea un Immobile auto-inserito dal Proprietario: nessuna agenzia, nessun contratto, solo i
 * dati base. Nasce in BOZZA_PROPRIETARIO (default dello schema), visibile solo a chi lo crea
 * finché non viene accettata una richiesta di gestione.
 */
export async function creaImmobileProprietarioAction(
  input: NuovoImmobileProprietarioInput
): Promise<{ success: true; immobile: ImmobileSummary } | { success: false; error: string; fieldErrors?: Record<string, string> }> {
  const { proprietario } = await requireProprietario();

  const parsed = nuovoImmobileProprietarioSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }
  const data = parsed.data;

  const immobile = await prisma.immobile.create({
    data: {
      proprietarioId: proprietario.id,
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

  revalidatePath("/proprietario/immobili");
  revalidatePath("/proprietario");

  return {
    success: true,
    immobile: { id: immobile.id, indirizzo: immobile.indirizzo, comune: immobile.comune, provincia: immobile.provincia },
  };
}

export interface AgenziaRisultatoRicerca {
  id: string;
  ragioneSociale: string;
  piva: string;
  email: string;
}

/** Cerca tra le agenzie già registrate sulla piattaforma, per ragione sociale o email. */
export async function cercaAgenzieAction(query: string): Promise<AgenziaRisultatoRicerca[]> {
  await requireProprietario();

  const risultati = await cercaAgenzie(query);
  return risultati.map((a) => ({ id: a.id, ragioneSociale: a.ragioneSociale, piva: a.piva, email: a.user.email }));
}

/** Invia una richiesta di gestione per un immobile ancora in BOZZA_PROPRIETARIO a un'agenzia
 * esistente. Un solo immobile può avere una sola richiesta IN_ATTESA alla volta. */
export async function richiediGestioneImmobileAction(
  input: RichiediGestioneImmobileInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { proprietario } = await requireProprietario();

  const parsed = richiediGestioneImmobileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const data = parsed.data;

  const immobile = await prisma.immobile.findFirst({ where: { id: data.immobileId, proprietarioId: proprietario.id } });
  if (!immobile) return { success: false, error: "Immobile non trovato" };
  if (immobile.stato !== "BOZZA_PROPRIETARIO") {
    return { success: false, error: "Questo immobile è già in gestione a un'agenzia" };
  }

  const agenzia = await prisma.agenzia.findUnique({ where: { id: data.agenziaId } });
  if (!agenzia) return { success: false, error: "Agenzia non trovata" };

  const richiestaEsistente = await prisma.richiestaGestioneImmobile.findFirst({
    where: { immobileId: immobile.id, stato: "IN_ATTESA" },
  });
  if (richiestaEsistente) {
    return { success: false, error: "C'è già una richiesta in attesa di risposta per questo immobile" };
  }

  await prisma.richiestaGestioneImmobile.create({
    data: {
      immobileId: immobile.id,
      proprietarioId: proprietario.id,
      agenziaId: agenzia.id,
      messaggio: data.messaggio || null,
    },
  });

  revalidatePath("/proprietario/immobili");
  revalidatePath("/agenzia/richieste-gestione");

  return { success: true };
}

/** L'agenzia accetta o rifiuta una richiesta di gestione ricevuta. Se accettata, l'immobile
 * passa in gestione (agenziaId assegnato, stato IN_GESTIONE_AGENZIA) ed entra nel portfolio. */
export async function rispondiRichiestaGestioneAction(
  input: RispondiRichiestaGestioneInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { session, agenzia } = await requireAgenzia();

  const parsed = rispondiRichiestaGestioneSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const data = parsed.data;

  const richiesta = await prisma.richiestaGestioneImmobile.findFirst({
    where: { id: data.richiestaId, agenziaId: agenzia.id, stato: "IN_ATTESA" },
  });
  if (!richiesta) return { success: false, error: "Richiesta non trovata" };

  const nuovoStato = data.accetta ? "ACCETTATA" : "RIFIUTATA";

  await prisma.$transaction([
    prisma.richiestaGestioneImmobile.update({
      where: { id: richiesta.id },
      data: { stato: nuovoStato, dataRisposta: new Date() },
    }),
    ...(data.accetta
      ? [
          prisma.immobile.update({
            where: { id: richiesta.immobileId },
            data: { agenziaId: agenzia.id, stato: "IN_GESTIONE_AGENZIA" as const },
          }),
        ]
      : []),
  ]);

  await registraLogAzione({
    userId: session.user.id,
    azione: data.accetta ? "Accettata richiesta di gestione immobile" : "Rifiutata richiesta di gestione immobile",
    entita: "Immobile",
    entitaId: richiesta.immobileId,
  });

  revalidatePath("/agenzia/richieste-gestione");
  revalidatePath("/agenzia/immobili");
  revalidatePath("/proprietario/immobili");

  return { success: true };
}
