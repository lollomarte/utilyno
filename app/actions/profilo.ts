"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAgenzia, requireAmministratore, requirePrivato } from "@/lib/auth-helpers";
import {
  aggiornaAgenziaSchema,
  aggiornaAmministratoreSchema,
  aggiornaPrivatoSchema,
  type AggiornaAgenziaInput,
  type AggiornaAmministratoreInput,
  type AggiornaPrivatoInput,
} from "@/lib/validations/profilo";

/**
 * Prima d'ora Agenzia/Amministratore/Proprietario potevano scrivere questi dati solo in fase di
 * registrazione: nessuna azione di modifica esisteva. Nate insieme ai campi business opzionali
 * (PEC, IBAN, SDI...) che devono poter essere compilati anche in un secondo momento.
 */
export async function aggiornaAgenziaAction(
  input: AggiornaAgenziaInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { agenzia } = await requireAgenzia();

  const parsed = aggiornaAgenziaSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const data = parsed.data;

  try {
    await prisma.agenzia.update({
      where: { id: agenzia.id },
      data: {
        ragioneSociale: data.ragioneSociale,
        piva: data.piva,
        indirizzo: data.indirizzo,
        telefono: data.telefono ?? null,
        pec: data.pec ?? null,
        codiceSdi: data.codiceSdi ?? null,
        ibanAgenzia: data.ibanAgenzia ?? null,
      },
    });
  } catch {
    return { success: false, error: "Partita IVA già in uso da un altro account" };
  }

  revalidatePath("/agenzia/profilo");

  return { success: true };
}

export async function aggiornaAmministratoreAction(
  input: AggiornaAmministratoreInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { amministratore } = await requireAmministratore();

  const parsed = aggiornaAmministratoreSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const data = parsed.data;

  try {
    await prisma.amministratore.update({
      where: { id: amministratore.id },
      data: {
        ragioneSociale: data.ragioneSociale,
        piva: data.piva,
        indirizzo: data.indirizzo,
        telefono: data.telefono ?? null,
        pec: data.pec ?? null,
        codiceSdi: data.codiceSdi ?? null,
      },
    });
  } catch {
    return { success: false, error: "Partita IVA già in uso da un altro account" };
  }

  revalidatePath("/amministratore/profilo");

  return { success: true };
}

export async function aggiornaPrivatoAction(
  input: AggiornaPrivatoInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { privato } = await requirePrivato();

  const parsed = aggiornaPrivatoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const data = parsed.data;

  await prisma.privato.update({
    where: { id: privato.id },
    data: {
      indirizzo: data.indirizzo ?? null,
      iban: data.iban ?? null,
      // I campi azienda restano quelli esistenti se il form (mostrato solo per profili AZIENDA)
      // non li invia: evita di azzerarli per un profilo PERSONA_FISICA che non li ha mai avuti.
      ...(privato.tipoSoggetto === "AZIENDA" && {
        ragioneSociale: data.ragioneSociale ?? privato.ragioneSociale,
        piva: data.piva ?? privato.piva,
        referenteNome: data.referenteNome ?? privato.referenteNome,
        referenteRuolo: data.referenteRuolo ?? privato.referenteRuolo,
      }),
    },
  });

  revalidatePath("/privato/profilo");

  return { success: true };
}
