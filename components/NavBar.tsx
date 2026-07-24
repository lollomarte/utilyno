"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "@/components/navItems";
import { NavDrawer } from "@/components/NavDrawer";

export function NavBar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-3xl px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-display font-bold tracking-tight text-lg flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
          Calciotto
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  active ? "bg-accent text-[#06210f]" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
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

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} pathname={pathname} />
    </header>
  );
}
