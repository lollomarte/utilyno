import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDocumentoConAccesso } from "@/lib/data/documenti";
import { documentoIdSchema } from "@/lib/validations/documento";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sessione non valida" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = documentoIdSchema.safeParse({ documentoId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: "Documento non valido" }, { status: 400 });
  }

  const documento = await getDocumentoConAccesso(parsed.data.documentoId, session.user.id, session.user.role);
  if (!documento) {
    return NextResponse.json({ error: "Documento non trovato" }, { status: 404 });
  }

  const blob = await get(documento.url, { access: "private" });
  if (!blob || !blob.stream) {
    return NextResponse.json({ error: "File non trovato" }, { status: 404 });
  }

  await prisma.documentoCondivisione.updateMany({
    where: { documentoId: documento.id, userId: session.user.id },
    data: { letto: true, dataLettura: new Date(), scaricato: true, dataScaricamento: new Date() },
  });

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": documento.tipo,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(documento.nome)}"`,
    },
  });
}
