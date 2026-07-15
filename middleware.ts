import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Tipo letterale locale (non da @prisma/client): stesso motivo di auth.config.ts, questo file
// va nel bundle Edge del middleware.
type Role = "ADMIN" | "AGENZIA" | "AMMINISTRATORE" | "PROPRIETARIO" | "INQUILINO";

// Per ogni sezione, i profili che danno accesso (basta possederne uno): /casa è la lista
// aggregata degli immobili, accessibile a chi è Proprietario e/o Inquilino di almeno uno.
const PROFILI_RICHIESTI_PER_SEZIONE: Record<string, Role[]> = {
  "/admin": ["ADMIN"],
  "/agenzia": ["AGENZIA"],
  "/amministratore": ["AMMINISTRATORE"],
  "/proprietario": ["PROPRIETARIO"],
  "/inquilino": ["INQUILINO"],
  "/casa": ["PROPRIETARIO", "INQUILINO"],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // Un utente può avere più profili (es. Proprietario di un immobile e Inquilino di un altro):
  // l'accesso a una sezione richiede solo di possedere UNO dei profili ammessi, non che sia l'unico.
  const profili = req.auth?.user?.profili ?? [];

  const matchedSection = Object.keys(PROFILI_RICHIESTI_PER_SEZIONE).find((section) =>
    nextUrl.pathname.startsWith(section)
  );

  if (!matchedSection) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const profiliAmmessi = PROFILI_RICHIESTI_PER_SEZIONE[matchedSection];
  if (!profiliAmmessi.some((p) => profili.includes(p))) {
    return NextResponse.redirect(new URL("/non-autorizzato", nextUrl));
  }

  return NextResponse.next();
});

// Il middleware protegge SOLO le sezioni per ruolo (/admin, /agenzia,
// /amministratore, /proprietario, /inquilino, /casa). /login, /register e tutti gli
// asset statici sono esclusi esplicitamente: farli passare da qui, insieme a
// un `auth()` che fallisce silenziosamente (es. AUTH_SECRET mancante),
// causerebbe un loop di redirect tra "/" e "/login". Il redirect "sei già
// loggato, vai al tuo portale" per chi visita /login da autenticato è
// gestito direttamente nella pagina (Server Component, Node runtime), non
// qui in Edge Runtime.
export const config = {
  matcher: [
    "/admin/:path*",
    "/agenzia/:path*",
    "/amministratore/:path*",
    "/proprietario/:path*",
    "/inquilino/:path*",
    "/casa/:path*",
  ],
};
