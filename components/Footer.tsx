"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted hidden sm:block">
      Calciotto del lunedì — ogni lunedì alle 21:00
    </footer>
  );
}
