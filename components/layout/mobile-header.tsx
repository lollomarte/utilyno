"use client";

import { usePathname } from "next/navigation";
import { isNavItemActive, type NavItem } from "@/components/layout/sidebar";

/** Header mobile minimale: solo il titolo della sezione corrente. */
export function MobileHeader({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();
  const rootHref = navItems[0]?.href;
  const active = navItems.find((item) => isNavItemActive(pathname, item, rootHref));

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-slate-200 bg-white px-4 md:hidden">
      <h1 className="text-[17px] font-semibold text-ink">{active?.label ?? "LOQO"}</h1>
    </header>
  );
}
