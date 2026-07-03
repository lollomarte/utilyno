"use client";

import { useState } from "react";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileHeader } from "@/components/layout/mobile-header";

export function PortalShell({
  portalLabel,
  roleLabel,
  navItems,
  nome,
  cognome,
  children,
}: {
  portalLabel: string;
  roleLabel: string;
  navItems: NavItem[];
  nome: string;
  cognome: string;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        portalLabel={portalLabel}
        items={navItems}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        nome={nome}
        cognome={cognome}
        roleLabel={roleLabel}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader portalLabel={portalLabel} onMenuOpen={() => setMobileNavOpen(true)} />
        <Header nome={nome} cognome={cognome} roleLabel={roleLabel} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
