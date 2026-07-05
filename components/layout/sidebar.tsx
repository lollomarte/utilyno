"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoqoSeal } from "@/components/brand/loqo-seal";
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
      <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-white/10 px-6">
        <LoqoSeal size={26} color="#ffffff" ring={false} />
        <div className="leading-tight">
          <span className="font-display block text-xl font-semibold tracking-tight text-white">LOQO</span>
          <span className="text-xs text-slate-400">{portalLabel}</span>
        </div>
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
                "group relative flex items-center gap-3 overflow-hidden rounded-control px-3 py-2 text-sm font-medium transition-colors duration-150",
                isActive ? "bg-primary-soft text-white" : "text-slate-300 hover:bg-primary-soft hover:text-white"
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-1 left-0 w-[3px] rounded-full bg-white transition-all duration-200 ease-out",
                  isActive ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              />
              <Icon
                className="h-5 w-5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110"
                strokeWidth={2}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
