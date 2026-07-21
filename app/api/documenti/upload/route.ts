import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nuovoDocumentoSchema } from "@/lib/validations/documento";
import { verificaAccessoContesto } from "@/lib/documenti/verificaAccessoContesto";
import { getPoolContestoDocumento, type ContestoDocumento } from "@/lib/documenti/risolviDestinatariDocumento";
import { registraLogAzione } from "@/lib/audit/registraLogAzione";
import { ROLE_LABELS } from "@/lib/labels";

const LIST_PATHS = [
  "/admin/documenti",
  "/agenzia/documenti",
  "/amministratore/documenti",
  "/proprietario/documenti",
  "/proprietario",
  "/inquilino/documenti",
];

function revalidateListe() {
  for (const path of LIST_PATHS) revalidatePath(path);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sessione non valida" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Seleziona un file da caricare" }, { status: 400 });
  }

  const parsed = nuovoDocumentoSchema.safeParse({
    contestoTipo: formData.get("contestoTipo"),
    contestoId: formData.get("contestoId"),
    scadenzaAutoEliminazione: formData.get("scadenzaAutoEliminazione") ?? "",
    destinatari: formData.getAll("destinatari"),
    categoria: formData.get("categoria") ?? "",
    scadenzaDocumento: formData.get("scadenzaDocumento") ?? "",
    nota: formData.get("nota") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }
  const data = parsed.data;
  const contesto: ContestoDocumento = { tipo: data.contestoTipo, id: data.contestoId };

  const haAccesso = await verificaAccessoContesto(session.user.id, contesto);
  if (!haAccesso) {
    return NextResponse.json({ error: "Non hai accesso a questo contesto" }, { status: 403 });
  }

  const pool = await getPoolContestoDocumento(contesto, session.user.id);
  const destinatariValidi = pool.filter((p) => data.destinatari.includes(p.userId));

  const blob = await put(`documenti/${randomUUID()}-${file.name}`, file, { access: "private" });

  const documento = await prisma.documento.create({
    data: {
      nome: file.name,
      url: blob.url,
      tipo: file.type || "application/octet-stream",
      caricatoDaUserId: session.user.id,
      scadenzaAutoEliminazione: data.scadenzaAutoEliminazione ?? null,
      categoria: data.categoria ?? null,
      scadenzaDocumento: data.scadenzaDocumento ?? null,
      nota: data.nota ?? null,
      immobileId: data.contestoTipo === "IMMOBILE" ? data.contestoId : null,
      contrattoId: data.contestoTipo === "CONTRATTO" ? data.contestoId : null,
      condominioId: data.contestoTipo === "CONDOMINIO" ? data.contestoId : null,
      condivisioni: {
        create: destinatariValidi.map((d) => ({ userId: d.userId, ruolo: d.ruolo })),
      },
    },
  });

  await registraLogAzione({
    userId: session.user.id,
    azione: "Caricamento documento",
    entita: "Documento",
    entitaId: documento.id,
    note: file.name,
  });

  revalidateListe();

  return NextResponse.json(
    {
      id: documento.id,
      condivisoCon: destinatariValidi.map((d) => ({ nome: d.nome, cognome: d.cognome, ruolo: ROLE_LABELS[d.ruolo] ?? d.ruolo })),
    },
    { status: 201 }
  );
}
