"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <path
        d="M4 11.5 12 5l8 6.5M6 10v9h5v-5h2v5h5v-9"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: "/classifiche/marcatori",
    label: "Classifiche",
    icon: (active: boolean) => (
      <path
        d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: "/risultati",
    label: "Risultati",
    icon: (active: boolean) => (
      <path
        d="M4 5h16v15H4zM4 9h16M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 sm:hidden bg-surface/95 backdrop-blur border-t border-line"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const section = "/" + item.href.split("/")[1];
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(section);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="tap flex flex-col items-center justify-center gap-1 py-2.5 flex-1 min-h-11"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className={active ? "text-accent" : "text-muted"}
              >
                {item.icon(active)}
              </svg>
              <span className={`text-[11px] font-medium ${active ? "text-accent" : "text-muted"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
