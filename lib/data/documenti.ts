import { prisma } from "@/lib/prisma";
import { eliminaDocumentiScaduti } from "@/lib/documenti/eliminaDocumentiScaduti";

const DOCUMENTO_INCLUDE = {
  immobile: true,
  contratto: { include: { immobile: true } },
  condominio: true,
  caricatoDa: true,
  condivisioni: { include: { user: true } },
} as const;

/** Ogni documento visibile per l'utente: quelli che ha caricato lui stesso, più quelli
 * condivisi esplicitamente con lui. Esegue prima il controllo di auto-eliminazione lazy,
 * così un documento scaduto non compare mai nella lista (viene cancellato al volo). */
export async function getDocumentiPerUtente(userId: string) {
  await eliminaDocumentiScaduti();

  return prisma.documento.findMany({
    where: { OR: [{ caricatoDaUserId: userId }, { condivisioni: { some: { userId } } }] },
    include: DOCUMENTO_INCLUDE,
    orderBy: { uploadedAt: "desc" },
  });
}

/** Tutti i documenti della piattaforma, per la vista di audit dell'Admin. */
export async function getTuttiIDocumenti() {
  await eliminaDocumentiScaduti();

  return prisma.documento.findMany({
    include: DOCUMENTO_INCLUDE,
    orderBy: { uploadedAt: "desc" },
  });
}

/** Verifica se l'utente ha diritto ad accedere (e scaricare) un documento: è chi lo ha
 * caricato, uno dei destinatari della condivisione, oppure un Admin (audit). */
export async function getDocumentoConAccesso(documentoId: string, userId: string, role: string) {
  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
    include: { condivisioni: true },
  });
  if (!documento) return null;

  const haAccesso =
    role === "ADMIN" ||
    documento.caricatoDaUserId === userId ||
    documento.condivisioni.some((c) => c.userId === userId);

  return haAccesso ? documento : null;
}
