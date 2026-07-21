"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/classifiche/marcatori", label: "Classifiche" },
  { href: "/risultati", label: "Risultati" },
];

export function NavBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-3xl px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-display font-bold tracking-tight text-lg flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
          Calciotto
        </Link>
        <nav className="hidden sm:flex gap-1">
          {links.map((link) => {
            const section = "/" + link.href.split("/")[1];
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(section);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  active ? "bg-accent text-[#06210f]" : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
