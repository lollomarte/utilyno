import type { Metadata, Viewport } from "next";
import { Oswald, Barlow } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { MotionProvider } from "@/components/MotionProvider";
import { ToastProvider } from "@/components/Toast";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Footer } from "@/components/Footer";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const SITE_NAME = "Calciotto di Pippi";
const SITE_DESCRIPTION = "Statistiche del gruppo di calciotto amatoriale";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
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
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#efe5cf",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${oswald.variable} ${barlow.variable}`}>
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
