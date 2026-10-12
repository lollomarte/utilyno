"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "@/components/navItems";
import { NavDrawer } from "@/components/NavDrawer";
import { NavExtraMenu } from "@/components/NavExtraMenu";

export function NavBar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur shadow-float">
      <div className="mx-auto max-w-3xl px-4 flex items-center justify-between h-14">
        <Link href="/" className="tap flex items-center gap-2" aria-label="Calciotto di Pippi, home">
          {/* Testata da album: scudetto rosso inclinato con il nome in giallo. */}
          <span className="-skew-x-12 rounded-md bg-album-red px-2.5 py-0.5 shadow-[2px_2px_0_var(--color-album-blue)]">
            <span className="block skew-x-12 font-display font-bold uppercase tracking-wide text-lg leading-tight text-album-yellow">
              Calciotto
            </span>
          </span>
          <span className="font-display text-xs uppercase tracking-widest text-muted leading-none">
            di Pippi
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.filter((item) => item.group !== "extra").map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  active ? "bg-accent text-on-accent" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <NavExtraMenu pathname={pathname} />
          <Link
            href="/admin"
            title="Area amministrazione"
            aria-label="Area amministrazione"
            className="tap ml-2 w-9 h-9 inline-flex items-center justify-center rounded-full border border-line text-muted hover:text-ink hover:border-line-strong"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M6 10V7a6 6 0 1 1 12 0v3M5 10h14v10H5z"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Apri il menu"
          aria-expanded={drawerOpen}
          className="tap lg:hidden w-11 h-11 -mr-2 inline-flex items-center justify-center text-ink"
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="album-stripe" aria-hidden />

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} pathname={pathname} />
    </header>
  );
}
