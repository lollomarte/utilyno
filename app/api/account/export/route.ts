import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { esportaDatiUtente } from "@/lib/account/esportaDatiUtente";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const dati = await esportaDatiUtente(session.user.id, session.user.role);
  if (!dati) {
    return NextResponse.json({ error: "Account non trovato" }, { status: 404 });
  }

  const data = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(dati, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="loqo-dati-${data}.json"`,
    },
  });
}
