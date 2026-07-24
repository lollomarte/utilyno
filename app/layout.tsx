import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { MotionProvider } from "@/components/MotionProvider";
import { ToastProvider } from "@/components/Toast";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Footer } from "@/components/Footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_NAME = "Calciotto di Pippi";
const SITE_DESCRIPTION = "Statistiche del gruppo di calciotto amatoriale";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <MotionProvider>
          <ToastProvider>
            <NavBar />
            <PullToRefresh>
              <main className="mx-auto max-w-3xl px-4 py-6 pb-10">{children}</main>
              <Footer />
            </PullToRefresh>
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
