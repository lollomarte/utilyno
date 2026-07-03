import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

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
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar portalLabel={portalLabel} items={navItems} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header nome={nome} cognome={cognome} roleLabel={roleLabel} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
