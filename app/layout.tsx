import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { SplashScreen } from "@/components/layout/splash-screen";
import "./globals.css";

// Solo il monospace viene caricato da Google Fonts (usato per codici/protocolli).
// Il font principale è lo stack di sistema definito in globals.css: niente
// download di font esterni, e su iOS risolve a San Francisco nativamente.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LOQO - Piattaforma di gestione affitti",
  description: "LOQO: l'infrastruttura B2B per la gestione di affitti, agenzie, amministratori di condominio, proprietari e inquilini.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SplashScreen />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
