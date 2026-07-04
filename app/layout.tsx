import type { Metadata, Viewport } from "next";
import { Geist_Mono, Newsreader } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { SplashScreen } from "@/components/layout/splash-screen";
import "./globals.css";

// Solo il monospace e il serif per titoli vengono caricati da Google Fonts,
// self-hosted da next/font (nessuna richiesta esterna a runtime, nessun FOUC).
// Il corpo testo resta lo stack di sistema definito in globals.css.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal"],
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
    <html lang="it" className={`${geistMono.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SplashScreen />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
