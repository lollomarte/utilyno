import { requireAgenzia } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";

const NAV_ITEMS = [
  { href: "/agenzia", label: "Dashboard" },
  { href: "/agenzia/contratti", label: "Contratti" },
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
