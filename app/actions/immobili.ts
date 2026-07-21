"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { requireAgenzia, requireAmministratore, requirePrivato } from "@/lib/auth-helpers";
import { cercaAgenzie } from "@/lib/data/agenzia";
import { registraLogAzione } from "@/lib/audit/registraLogAzione";
import { risolviUserPerProfiloPrivato } from "@/lib/utenti/risolviUserPerProfiloPrivato";
import { assicuraRelazioneAttiva, getRelazioneProprietarioAttiva } from "@/lib/immobili/relazioni";
import {
  nuovoImmobileSchema,
  collegaImmobileEsistenteSchema,
  creaImmobilePerCondominioSchema,
  nuovoImmobileProprietarioSchema,
  aggiornaImmobileSchema,
  richiediGestioneImmobileSchema,
  rispondiRichiestaGestioneSchema,
  type NuovoImmobileInput,
  type CollegaImmobileEsistenteInput,
  type CreaImmobilePerCondominioInput,
  type NuovoImmobileProprietarioInput,
  type AggiornaImmobileInput,
  type RichiediGestioneImmobileInput,
  type RispondiRichiestaGestioneInput,
} from "@/lib/validations/immobile";

type ImmobileSummary = { id: string; indirizzo: string; comune: string; provincia: string };

/** Mappa i "dati aggiuntivi opzionali" condivisi da ogni schema di creazione/modifica Immobile
 * (vedi immobileDatiAggiuntiviFields) sui campi Prisma corrispondenti, con `null` esplicito per
 * chi resta non compilato: evita di ripetere gli stessi 16 campi in ogni azione. */
function datiAggiuntiviImmobile(data: {
  foglio?: string;
  particella?: string;
  subalterno?: string;
  categoriaCatastale?: string;
  renditaCatastale?: number;
  apeScadenza?: Date;
  numeroVani?: number;
  piano?: string;
  ascensore?: boolean;
  annoCostruzione?: number;
  condizioneImmobile?: "NUOVO" | "RISTRUTTURATO" | "DA_RISTRUTTURARE";
  arredato?: boolean;
  dotazioni?: string[];
  tipoRiscaldamento?: "AUTONOMO" | "CENTRALIZZATO";
  speseCondominialiMensili?: number;
  noteStima?: string;
}) {
  return {
    foglio: data.foglio ?? null,
    particella: data.particella ?? null,
    subalterno: data.subalterno ?? null,
    categoriaCatastale: data.categoriaCatastale ?? null,
    renditaCatastale: data.renditaCatastale ?? null,
    apeScadenza: data.apeScadenza ?? null,
    numeroVani: data.numeroVani ?? null,
    piano: data.piano ?? null,
    ascensore: data.ascensore ?? null,
    annoCostruzione: data.annoCostruzione ?? null,
    condizioneImmobile: data.condizioneImmobile ?? null,
    arredato: data.arredato ?? null,
    dotazioni: data.dotazioni ?? [],
    tipoRiscaldamento: data.tipoRiscaldamento ?? null,
    speseCondominialiMensili: data.speseCondominialiMensili ?? null,
    noteStima: data.noteStima ?? null,
  };
}

/** Risolve il Privato (proprietario) da usare per un nuovo Immobile: crea User+Privato al volo
 * se in modalità "nuovo". `accountEsistente: true` segnala al chiamante che l'email inserita era
 * già di un account esistente (es. la persona è già inquilina altrove): in quel caso la password
 * inserita nel form non è stata usata (l'account mantiene la propria), il chiamante deve
 * informarne l'operatore. */
async function risolviProprietario(data: {
  proprietarioMode: "esistente" | "nuovo";
  proprietarioId?: string;
  proprietarioNome?: string;
  proprietarioCognome?: string;
  proprietarioEmail?: string;
  proprietarioCodiceFiscale?: string;
  proprietarioIndirizzo?: string;
  proprietarioPassword?: string;
}): Promise<
  | { success: true; proprietarioId: string; accountEsistente: boolean }
  | { success: false; error: string; fieldErrors?: Record<string, string> }
> {
  if (data.proprietarioMode === "esistente") {
    if (!data.proprietarioId) return { success: false, error: "Proprietario non valido" };
    return { success: true, proprietarioId: data.proprietarioId, accountEsistente: false };
  }

  const { privatoId, nuovoUser } = await risolviUserPerProfiloPrivato({
    email: data.proprietarioEmail!,
    nome: data.proprietarioNome!,
    cognome: data.proprietarioCognome!,
    password: data.proprietarioPassword!,
    codiceFiscale: data.proprietarioCodiceFiscale!,
    indirizzo: data.proprietarioIndirizzo!,
  });

  return { success: true, proprietarioId: privatoId, accountEsistente: !nuovoUser };
}

export async function creaImmobileAction(
  input: NuovoImmobileInput
): Promise<
  | { success: true; immobile: ImmobileSummary; proprietarioAccountEsistente: boolean }
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
      ...datiAggiuntiviImmobile(data),
    },
  });

  await assicuraRelazioneAttiva({ privatoId: risolto.proprietarioId, immobileId: immobile.id, ruolo: "PROPRIETARIO" });

  revalidatePath("/agenzia/immobili");

  return {
    success: true,
    immobile: { id: immobile.id, indirizzo: immobile.indirizzo, comune: immobile.comune, provincia: immobile.provincia },
    proprietarioAccountEsistente: risolto.accountEsistente,
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
): Promise<
  | { success: true; proprietarioAccountEsistente: boolean }
  | { success: false; error: string; fieldErrors?: Record<string, string> }
> {
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

  const immobile = await prisma.immobile.create({
    data: {
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
      ...datiAggiuntiviImmobile(data),
    },
  });

  await assicuraRelazioneAttiva({ privatoId: risolto.proprietarioId, immobileId: immobile.id, ruolo: "PROPRIETARIO" });

  revalidatePath(`/amministratore/condomini/${condominio.id}`);

  return { success: true, proprietarioAccountEsistente: risolto.accountEsistente };
}

/**
 * Crea un Immobile auto-inserito da un Privato (ruolo PROPRIETARIO sull'immobile): nessuna
 * agenzia, nessun contratto, solo i dati base. Nasce in BOZZA_PROPRIETARIO (default dello
 * schema), visibile solo a chi lo crea finché non viene accettata una richiesta di gestione.
 */
export async function creaImmobileProprietarioAction(
  input: NuovoImmobileProprietarioInput
): Promise<{ success: true; immobile: ImmobileSummary } | { success: false; error: string; fieldErrors?: Record<string, string> }> {
  const { privato } = await requirePrivato();

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
      indirizzo: data.indirizzo,
      comune: data.comune,
      provincia: data.provincia.toUpperCase(),
      datiCatastali: data.datiCatastali,
      superficieMq: data.superficieMq,
      tipoImmobile: data.tipoImmobile,
      apeClasse: data.apeClasse || null,
      valoreStimato: data.valoreStimato,
      ...datiAggiuntiviImmobile(data),
    },
  });

  await assicuraRelazioneAttiva({ privatoId: privato.id, immobileId: immobile.id, ruolo: "PROPRIETARIO" });

  revalidatePath("/privato");

  return {
    success: true,
    immobile: { id: immobile.id, indirizzo: immobile.indirizzo, comune: immobile.comune, provincia: immobile.provincia },
  };
}

/** Chi può modificare i dati di un Immobile: il proprietario attivo, l'Agenzia che lo gestisce,
 * o l'Amministratore del condominio a cui appartiene — stessa logica di verificaAccessoImmobile
 * in app/actions/segnalazioni.ts. */
async function verificaAccessoModificaImmobile(userId: string, immobileId: string): Promise<boolean> {
  const immobile = await prisma.immobile.findUnique({
    where: { id: immobileId },
    include: {
      agenzia: true,
      condominio: true,
      relazioni: { where: { ruolo: "PROPRIETARIO", stato: "ATTIVA" }, include: { privato: true } },
    },
  });
  if (!immobile) return false;

  if (immobile.relazioni.some((r) => r.privato.userId === userId)) return true;
  if (immobile.agenzia?.userId === userId) return true;
  if (immobile.condominio) {
    const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
    if (amministratore?.id === immobile.condominio.amministratoreId) return true;
  }
  return false;
}

/**
 * Modifica i dati propri di un Immobile già esistente (non le relazioni proprietario/agenzia/
 * condominio, che non si spostano da qui). Prima d'ora non esisteva nessun form di modifica:
 * i dati "aggiuntivi opzionali" nati con questa azione dovevano poter essere compilati anche
 * in un secondo momento, non solo alla creazione.
 */
export async function aggiornaImmobileAction(
  input: AggiornaImmobileInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Sessione non valida" };

  const parsed = aggiornaImmobileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const data = parsed.data;

  const haAccesso = await verificaAccessoModificaImmobile(session.user.id, data.immobileId);
  if (!haAccesso) return { success: false, error: "Non hai accesso a questo immobile" };

  await prisma.immobile.update({
    where: { id: data.immobileId },
    data: {
      indirizzo: data.indirizzo,
      comune: data.comune,
      provincia: data.provincia.toUpperCase(),
      datiCatastali: data.datiCatastali,
      superficieMq: data.superficieMq,
      tipoImmobile: data.tipoImmobile,
      apeClasse: data.apeClasse || null,
      valoreStimato: data.valoreStimato,
      ...datiAggiuntiviImmobile(data),
    },
  });

  revalidatePath("/privato");
  revalidatePath(`/privato/${data.immobileId}`);
  revalidatePath("/agenzia/immobili");
  revalidatePath(`/agenzia/immobili/${data.immobileId}`);

  return { success: true };
}

export interface AgenziaRisultatoRicerca {
  id: string;
  ragioneSociale: string;
  piva: string;
  email: string;
}

/** Cerca tra le agenzie già registrate sulla piattaforma, per ragione sociale o email. */
export async function cercaAgenzieAction(query: string): Promise<AgenziaRisultatoRicerca[]> {
  await requirePrivato();

  const risultati = await cercaAgenzie(query);
  return risultati.map((a) => ({ id: a.id, ragioneSociale: a.ragioneSociale, piva: a.piva, email: a.user.email }));
}

/** Invia una richiesta di gestione per un immobile ancora in BOZZA_PROPRIETARIO a un'agenzia
 * esistente. Un solo immobile può avere una sola richiesta IN_ATTESA alla volta. */
export async function richiediGestioneImmobileAction(
  input: RichiediGestioneImmobileInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { privato } = await requirePrivato();

  const parsed = richiediGestioneImmobileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const data = parsed.data;

  const relazione = await getRelazioneProprietarioAttiva(data.immobileId);
  if (!relazione || relazione.privatoId !== privato.id) return { success: false, error: "Immobile non trovato" };

  const immobile = await prisma.immobile.findUnique({ where: { id: data.immobileId } });
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
      proprietarioId: privato.id,
      agenziaId: agenzia.id,
      messaggio: data.messaggio || null,
    },
  });

  revalidatePath("/privato");
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
  revalidatePath("/privato");

  return { success: true };
}
