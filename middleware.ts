import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const ROLE_BY_SECTION: Record<string, string> = {
  "/admin": "ADMIN",
  "/agenzia": "AGENZIA",
  "/amministratore": "AMMINISTRATORE",
  "/proprietario": "PROPRIETARIO",
  "/inquilino": "INQUILINO",
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const matchedSection = Object.keys(ROLE_BY_SECTION).find((section) =>
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

  if (role !== ROLE_BY_SECTION[matchedSection]) {
    return NextResponse.redirect(new URL("/non-autorizzato", nextUrl));
  }

  return NextResponse.next();
});

// Il middleware protegge SOLO le sezioni per ruolo (/admin, /agenzia,
// /amministratore, /proprietario, /inquilino). /login, /register e tutti gli
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
  ],
};
