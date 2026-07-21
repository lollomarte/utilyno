import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { TabBar } from "@/components/layout/tab-bar";
import { PageTransition } from "@/components/layout/page-transition";
import { CommandPaletteProvider } from "@/components/layout/command-palette";
import { raccogliNotifiche } from "@/lib/notifiche/raccogliNotifiche";
import type { PortaleVoce } from "@/components/layout/portali-switcher";

export async function PortalShell({
  portalLabel,
  roleLabel,
  navItems,
  nome,
  cognome,
  userId,
  switcherVoci,
  children,
}: {
  portalLabel: string;
  roleLabel: string;
  navItems: NavItem[];
  nome: string;
  cognome: string;
  userId: string;
  /** Presente solo in /privato/[immobileId]: elenco di tutti gli immobili dell'utente, per lo
   * switcher in header che cambia il contesto (e con esso ruolo/nav) senza tornare alla lista. */
  switcherVoci?: PortaleVoce[];
  children: React.ReactNode;
}) {
  const portaliVoci = switcherVoci ?? [];

  // "Profilo" è raggiungibile solo dalla navigazione mobile: su desktop
  // nome/ruolo/logout restano sempre visibili nell'header in alto. Quando lo switcher ha più di
  // una voce, anche "I miei immobili" (/privato) diventa raggiungibile da mobile allo stesso modo.
  const mobileNavItems: NavItem[] = [
    ...navItems,
    ...(portaliVoci.length > 1 && navItems[0]?.href !== "/privato" ? [{ href: "/privato", label: "I miei immobili" }] : []),
    { href: `${navItems[0]?.href ?? ""}/profilo`, label: "Profilo" },
  ];

  const notifiche = await raccogliNotifiche(userId);

  return (
    <CommandPaletteProvider navItems={mobileNavItems}>
      <div className="flex h-screen bg-surface-muted">
        <Sidebar portalLabel={portalLabel} items={navItems} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <MobileHeader navItems={mobileNavItems} notifiche={notifiche} />
          <Header nome={nome} cognome={cognome} roleLabel={roleLabel} notifiche={notifiche} portaliVoci={portaliVoci} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-8 md:pb-8">
            <PageTransition>{children}</PageTransition>
          </main>
          <TabBar items={mobileNavItems} />
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
