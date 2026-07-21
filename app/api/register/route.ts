import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dati non validi", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ error: "Email già registrata" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: data.role,
      nome: data.nome,
      cognome: data.cognome,
      telefono: data.telefono || null,
      ...(data.role === "AGENZIA" && {
        agenzia: {
          create: {
            ragioneSociale: data.ragioneSociale,
            piva: data.piva,
            indirizzo: data.indirizzo,
          },
        },
      }),
      ...(data.role === "AMMINISTRATORE" && {
        amministratore: {
          create: {
            ragioneSociale: data.ragioneSociale,
            piva: data.piva,
            indirizzo: data.indirizzo,
          },
        },
      }),
      // PRIVATO: il profilo Privato nasce subito con l'account (a differenza del vecchio
      // Proprietario/Inquilino, non serve più un'attivazione separata) — il ruolo per-immobile
      // (proprietario/inquilino) si sceglie dopo, nel flusso "Aggiungi immobile".
      ...(data.role === "PRIVATO" && {
        privato: {
          create:
            data.tipoSoggetto === "AZIENDA"
              ? {
                  tipoSoggetto: data.tipoSoggetto,
                  ragioneSociale: data.ragioneSociale,
                  piva: data.piva,
                  codiceFiscale: data.codiceFiscale,
                  referenteNome: data.referenteNome,
                  referenteRuolo: data.referenteRuolo,
                }
              : {
                  tipoSoggetto: data.tipoSoggetto,
                  codiceFiscale: data.codiceFiscale,
                },
        },
      }),
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
}
