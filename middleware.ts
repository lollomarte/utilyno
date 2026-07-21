import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Tipo letterale locale (non da @prisma/client): stesso motivo di auth.config.ts, questo file
// va nel bundle Edge del middleware.
type Role = "ADMIN" | "AGENZIA" | "AMMINISTRATORE" | "PRIVATO";

// Per ogni sezione, il ruolo richiesto. A differenza di prima, un solo ruolo per sezione:
// PROPRIETARIO/INQUILINO non esistono più a livello di account, quindi non serve più
// ammettere "uno tra più profili" — /privato è raggiungibile da chiunque abbia ruolo PRIVATO,
// indipendentemente da quali RelazioneImmobilePrivato possieda (anche zero, vedi stato vuoto).
const RUOLO_RICHIESTO_PER_SEZIONE: Record<string, Role> = {
  "/admin": "ADMIN",
  "/agenzia": "AGENZIA",
  "/amministratore": "AMMINISTRATORE",
  "/privato": "PRIVATO",
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const ruolo = req.auth?.user?.role;

  const matchedSection = Object.keys(RUOLO_RICHIESTO_PER_SEZIONE).find((section) =>
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

  if (ruolo !== RUOLO_RICHIESTO_PER_SEZIONE[matchedSection]) {
    return NextResponse.redirect(new URL("/non-autorizzato", nextUrl));
  }

  return NextResponse.next();
});

// Il middleware protegge SOLO le sezioni per ruolo (/admin, /agenzia,
// /amministratore, /privato). /login, /register e tutti gli
// asset statici sono esclusi esplicitamente: farli passare da qui, insieme a
// un `auth()` che fallisce silenziosamente (es. AUTH_SECRET mancante),
// causerebbe un loop di redirect tra "/" e "/login". Il redirect "sei già
// loggato, vai al tuo portale" per chi visita /login da autenticato è
// gestito direttamente nella pagina (Server Component, Node runtime), non
// qui in Edge Runtime.
export const config = {
  matcher: ["/admin/:path*", "/agenzia/:path*", "/amministratore/:path*", "/privato/:path*"],
};
