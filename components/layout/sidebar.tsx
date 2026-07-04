"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavIcon } from "@/components/layout/nav-icons";

export interface NavItem {
  href: string;
  label: string;
}

export function isNavItemActive(pathname: string, item: NavItem, rootHref?: string) {
  if (pathname === item.href) return true;
  if (item.href === rootHref) return false;
  return pathname.startsWith(`${item.href}/`);
}

export function Sidebar({ portalLabel, items }: { portalLabel: string; items: NavItem[] }) {
  const pathname = usePathname();
  const rootHref = items[0]?.href;

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col bg-primary text-slate-100 md:flex">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6">
        <span className="text-lg font-semibold tracking-tight text-white">LOQO</span>
        <span className="text-xs text-slate-400">{portalLabel}</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item, rootHref);
          const Icon = getNavIcon(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary-soft text-white" : "text-slate-300 hover:bg-primary-soft hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
