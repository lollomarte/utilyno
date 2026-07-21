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

  return (
    <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-3xl px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold tracking-tight text-lg">
          Calciotto ⚽
        </Link>
        <nav className="flex gap-1">
          {links.map((link) => {
            const section = "/" + link.href.split("/")[1];
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(section);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm rounded-full transition-colors ${
                  active ? "bg-nera text-paper" : "text-ink/70 hover:bg-line"
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
