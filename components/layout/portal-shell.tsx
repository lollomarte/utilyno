import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { TabBar } from "@/components/layout/tab-bar";

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
  // "Profilo" è raggiungibile solo dalla navigazione mobile: su desktop
  // nome/ruolo/logout restano sempre visibili nell'header in alto.
  const mobileNavItems: NavItem[] = [...navItems, { href: `${navItems[0]?.href ?? ""}/profilo`, label: "Profilo" }];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar portalLabel={portalLabel} items={navItems} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader navItems={mobileNavItems} />
        <Header nome={nome} cognome={cognome} roleLabel={roleLabel} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-8 md:pb-8">{children}</main>
        <TabBar items={mobileNavItems} />
      </div>
    </div>
  );
}
