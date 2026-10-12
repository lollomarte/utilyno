"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mx-auto max-w-3xl px-4 py-10 text-center hidden sm:flex flex-col items-center gap-3">
      <div className="album-stripe w-24 rounded-full" aria-hidden />
      <p className="font-display text-sm uppercase tracking-widest text-muted">
        Album ufficiale Calciotto di Pippi · ogni lunedì alle 21:00
      </p>
    </footer>
  );
}
