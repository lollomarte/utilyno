import { requireAgenzia } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/agenzia", label: "Dashboard" },
  { href: "/agenzia/immobili", label: "Immobili" },
  { href: "/agenzia/contratti", label: "Contratti" },
  { href: "/agenzia/segnalazioni", label: "Segnalazioni" },
];

export default async function AgenziaLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requireAgenzia();

  return (
    <PortalShell
      portalLabel="Portale Agenzia"
      roleLabel="Agenzia"
      navItems={NAV_ITEMS}
      nome={session.user.nome}
      cognome={session.user.cognome}
    >
      {children}
    </PortalShell>
  );
}
