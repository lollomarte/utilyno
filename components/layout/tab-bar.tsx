"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavItemActive, type NavItem } from "@/components/layout/sidebar";
import { getNavIcon } from "@/components/layout/nav-icons";

/** Navigazione a tab bar inferiore (pattern iOS), sostituisce la sidebar sotto md. */
export function TabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const rootHref = items[0]?.href;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 backdrop-blur supports-backdrop-blur:bg-white/80 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const isActive = isNavItemActive(pathname, item, rootHref);
        const Icon = getNavIcon(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors",
              isActive ? "text-primary" : "text-slate-400"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
