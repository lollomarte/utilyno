"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAgenzia, requireAmministratore, requireProprietario } from "@/lib/auth-helpers";
import {
  aggiornaAgenziaSchema,
  aggiornaAmministratoreSchema,
  aggiornaProprietarioSchema,
  type AggiornaAgenziaInput,
  type AggiornaAmministratoreInput,
  type AggiornaProprietarioInput,
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

export async function aggiornaProprietarioAction(
  input: AggiornaProprietarioInput
): Promise<{ success: true } | { success: false; error: string }> {
  const { proprietario } = await requireProprietario();

  const parsed = aggiornaProprietarioSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };
  const data = parsed.data;

  await prisma.proprietario.update({
    where: { id: proprietario.id },
    data: {
      indirizzo: data.indirizzo,
      ibanProprietario: data.ibanProprietario ?? null,
    },
  });

  revalidatePath("/proprietario/profilo");

  return { success: true };
}
