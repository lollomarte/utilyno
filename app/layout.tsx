import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calciotto del Lunedì",
  description: "Statistiche del gruppo di calciotto amatoriale",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <NavBar />
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted">
          Calciotto del lunedì — ogni lunedì alle 21:00
        </footer>
      </body>
    </html>
  );
}
