"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAgenzia, requirePrivato } from "@/lib/auth-helpers";
import { nuovaChecklistSchema } from "@/lib/validations/checklist";

export async function creaChecklistAction(formData: FormData): Promise<{ success: true } | { success: false; error: string }> {
  const { agenzia } = await requireAgenzia();

  const parsed = nuovaChecklistSchema.safeParse({
    contrattoId: formData.get("contrattoId"),
    tipo: formData.get("tipo"),
    note: formData.get("note") || undefined,
    firmaProprietario: formData.get("firmaProprietario") === "on",
    letturaLuce: formData.get("letturaLuce") ?? "",
    letturaGas: formData.get("letturaGas") ?? "",
    letturaAcqua: formData.get("letturaAcqua") ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: "Dati non validi" };
  }
  const data = parsed.data;

  const contratto = await prisma.contratto.findFirst({ where: { id: data.contrattoId, agenziaId: agenzia.id } });
  if (!contratto) {
    return { success: false, error: "Contratto non trovato" };
  }

  const foto = formData.getAll("foto").filter((f): f is File => f instanceof File && f.size > 0);
  const fotoUrls = foto.map((f) => `/checklist/mock/${f.name}`);

  await prisma.checklistImmobile.create({
    data: {
      contrattoId: data.contrattoId,
      tipo: data.tipo,
      note: data.note || null,
      fotoUrls,
      firmaProprietario: data.firmaProprietario,
      firmaProprietarioAt: data.firmaProprietario ? new Date() : null,
      letturaLuce: data.letturaLuce ?? null,
      letturaGas: data.letturaGas ?? null,
      letturaAcqua: data.letturaAcqua ?? null,
    },
  });

  revalidatePath(`/agenzia/contratti/${data.contrattoId}`);
  revalidatePath("/privato");

  return { success: true };
}

export async function firmaChecklistInquilinoAction(
  checklistId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const { privato } = await requirePrivato();

  const checklist = await prisma.checklistImmobile.findFirst({
    where: { id: checklistId, contratto: { inquilinoId: privato.id } },
  });
  if (!checklist) {
    return { success: false, error: "Checklist non trovata" };
  }

  await prisma.checklistImmobile.update({
    where: { id: checklistId },
    data: { firmaInquilino: true, firmaInquilinoAt: new Date() },
  });

  revalidatePath("/privato");

  return { success: true };
}
