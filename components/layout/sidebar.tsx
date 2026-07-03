"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserBlock } from "@/components/layout/header";

export interface NavItem {
  href: string;
  label: string;
}

interface NavLinksProps {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}

function NavLinks({ items, pathname, onNavigate }: NavLinksProps) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand({ portalLabel }: { portalLabel: string }) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 px-6">
      <span className="text-lg font-semibold tracking-tight text-white">LOQO</span>
      <span className="text-xs text-slate-400">{portalLabel}</span>
    </div>
  );
}

export function Sidebar({
  portalLabel,
  items,
  mobileOpen = false,
  onClose,
  nome,
  cognome,
  roleLabel,
}: {
  portalLabel: string;
  items: NavItem[];
  mobileOpen?: boolean;
  onClose?: () => void;
  nome: string;
  cognome: string;
  roleLabel: string;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 md:flex">
        <SidebarBrand portalLabel={portalLabel} />
        <NavLinks items={items} pathname={pathname} />
      </aside>

      <div className={cn("fixed inset-0 z-40 md:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div
          className={cn("absolute inset-0 bg-black/50 transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")}
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-64 flex-col bg-slate-900 text-slate-100 shadow-xl transition-transform duration-200 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
          aria-hidden={!mobileOpen}
        >
          <SidebarBrand portalLabel={portalLabel} />
          <NavLinks items={items} pathname={pathname} onNavigate={onClose} />
          <div className="border-t border-slate-800 px-4 py-4">
            <UserBlock nome={nome} cognome={cognome} roleLabel={roleLabel} variant="dark" className="flex-wrap justify-between" />
          </div>
        </aside>
      </div>
    </>
  );
}
