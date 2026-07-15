import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { TabBar } from "@/components/layout/tab-bar";
import { PageTransition } from "@/components/layout/page-transition";
import { CommandPaletteProvider } from "@/components/layout/command-palette";
import { raccogliNotifiche } from "@/lib/notifiche/raccogliNotifiche";

type ProfiloPrivato = "PROPRIETARIO" | "INQUILINO";

const PORTALE_LABEL: Record<ProfiloPrivato, string> = {
  PROPRIETARIO: "Portale Proprietario",
  INQUILINO: "Portale Inquilino",
};
const PORTALE_HREF: Record<ProfiloPrivato, string> = {
  PROPRIETARIO: "/proprietario",
  INQUILINO: "/inquilino",
};

export async function PortalShell({
  portalLabel,
  roleLabel,
  navItems,
  nome,
  cognome,
  userId,
  profili,
  children,
}: {
  portalLabel: string;
  roleLabel: string;
  navItems: NavItem[];
  nome: string;
  cognome: string;
  userId: string;
  /** Presente solo per i portali Proprietario/Inquilino/casa: se l'utente possiede entrambi i
   * profili, mostra nell'header il selettore per passare dall'uno all'altro. */
  profili?: ProfiloPrivato[];
  children: React.ReactNode;
}) {
  const haDoppioProfilo = (profili?.length ?? 0) === 2;
  const portaliVoci = haDoppioProfilo
    ? [...profili!.map((p) => ({ href: PORTALE_HREF[p], label: PORTALE_LABEL[p] })), { href: "/casa", label: "I miei immobili" }]
    : [];

  // "Profilo" è raggiungibile solo dalla navigazione mobile: su desktop
  // nome/ruolo/logout restano sempre visibili nell'header in alto. Con doppio profilo, anche
  // "I miei immobili" (/casa) diventa raggiungibile da mobile allo stesso modo.
  const mobileNavItems: NavItem[] = [
    ...navItems,
    ...(haDoppioProfilo && navItems[0]?.href !== "/casa" ? [{ href: "/casa", label: "I miei immobili" }] : []),
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
