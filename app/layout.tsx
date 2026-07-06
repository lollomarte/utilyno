import type { Metadata, Viewport } from "next";
import { Geist_Mono, Fraunces, Public_Sans } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { SplashScreen } from "@/components/layout/splash-screen";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

// Tutta la tipografia è self-hosted via next/font (nessuna richiesta esterna
// a runtime, nessun FOUC). Fraunces (serif morbido) è riservato ai titoli
// grandi, Public Sans a tutto il corpo testo, Geist Mono a ogni numero
// (importi, date, codici contratto, KPI) — vedi DESIGN_PLAN.md §3.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LOQO - Piattaforma di gestione affitti",
  description: "LOQO: l'infrastruttura B2B per la gestione di affitti, agenzie, amministratori di condominio, proprietari e inquilini.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e2f3c",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geistMono.variable} ${fraunces.variable} ${publicSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SplashScreen />
        <AuthSessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
