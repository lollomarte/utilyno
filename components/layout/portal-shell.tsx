import type { Role } from "@prisma/client";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { TabBar } from "@/components/layout/tab-bar";
import { PageTransition } from "@/components/layout/page-transition";
import { CommandPaletteProvider } from "@/components/layout/command-palette";
import { raccogliNotifiche } from "@/lib/notifiche/raccogliNotifiche";

export async function PortalShell({
  portalLabel,
  roleLabel,
  navItems,
  nome,
  cognome,
  userId,
  role,
  children,
}: {
  portalLabel: string;
  roleLabel: string;
  navItems: NavItem[];
  nome: string;
  cognome: string;
  userId: string;
  role: Role;
  children: React.ReactNode;
}) {
  // "Profilo" è raggiungibile solo dalla navigazione mobile: su desktop
  // nome/ruolo/logout restano sempre visibili nell'header in alto.
  const mobileNavItems: NavItem[] = [...navItems, { href: `${navItems[0]?.href ?? ""}/profilo`, label: "Profilo" }];

  const notifiche = await raccogliNotifiche(userId, role);

  return (
    <CommandPaletteProvider navItems={mobileNavItems}>
      <div className="flex h-screen bg-surface-muted">
        <Sidebar portalLabel={portalLabel} items={navItems} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <MobileHeader navItems={mobileNavItems} notifiche={notifiche} />
          <Header nome={nome} cognome={cognome} roleLabel={roleLabel} notifiche={notifiche} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-8 md:pb-8">
            <PageTransition>{children}</PageTransition>
          </main>
          <TabBar items={mobileNavItems} />
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
