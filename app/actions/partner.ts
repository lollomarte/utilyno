"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  partnerSchema,
  aggiornaStatoRichiestaPreventivoSchema,
  type PartnerInput,
} from "@/lib/validations/partner";
import type { StatoRichiestaPreventivo } from "@prisma/client";

export async function creaPartnerAction(input: PartnerInput): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  await prisma.partner.create({
    data: {
      nome: parsed.data.nome,
      categoria: parsed.data.categoria,
      zonaCopertura: parsed.data.zonaCopertura,
      telefono: parsed.data.telefono,
      email: parsed.data.email,
      contattoReferente: parsed.data.contattoReferente,
      commissioneMedia: parsed.data.commissioneMedia,
      piva: parsed.data.piva ?? null,
      pec: parsed.data.pec ?? null,
    },
  });

  revalidatePath("/admin/lead");

  return { success: true };
}

export async function aggiornaPartnerAction(
  partnerId: string,
  input: PartnerInput
): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  await prisma.partner.update({
    where: { id: partnerId },
    data: {
      nome: parsed.data.nome,
      categoria: parsed.data.categoria,
      zonaCopertura: parsed.data.zonaCopertura,
      telefono: parsed.data.telefono,
      email: parsed.data.email,
      contattoReferente: parsed.data.contattoReferente,
      commissioneMedia: parsed.data.commissioneMedia,
      piva: parsed.data.piva ?? null,
      pec: parsed.data.pec ?? null,
    },
  });

  revalidatePath("/admin/lead");

  return { success: true };
}

export async function togglePartnerAttivoAction(partnerId: string): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner) return { success: false, error: "Partner non trovato" };

  await prisma.partner.update({ where: { id: partnerId }, data: { attivo: !partner.attivo } });

  revalidatePath("/admin/lead");

  return { success: true };
}

export async function aggiornaStatoRichiestaPreventivoAction(
  richiestaId: string,
  stato: StatoRichiestaPreventivo
): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const parsed = aggiornaStatoRichiestaPreventivoSchema.safeParse({ richiestaId, stato });
  if (!parsed.success) return { success: false, error: "Dati non validi" };

  await prisma.richiestaPreventivo.update({
    where: { id: parsed.data.richiestaId },
    data: { stato: parsed.data.stato },
  });

  revalidatePath("/admin/lead");

  return { success: true };
}
