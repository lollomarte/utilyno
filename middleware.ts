import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig, PORTAL_BY_ROLE } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const ROLE_BY_SECTION: Record<string, string> = {
  "/admin": "ADMIN",
  "/agenzia": "AGENZIA",
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

  if (matchedSection) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== ROLE_BY_SECTION[matchedSection]) {
      return NextResponse.redirect(new URL("/non-autorizzato", nextUrl));
    }
  }

  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL(PORTAL_BY_ROLE[role ?? ""] ?? "/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
