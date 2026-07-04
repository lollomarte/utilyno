import { requireProprietario } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";

const NAV_ITEMS: NavItem[] = [{ href: "/proprietario", label: "Dashboard" }];

export default async function ProprietarioLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requireProprietario();

  return (
    <PortalShell
      portalLabel="Portale Proprietario"
      roleLabel="Proprietario"
      navItems={NAV_ITEMS}
      nome={session.user.nome}
      cognome={session.user.cognome}
    >
      {children}
    </PortalShell>
  );
}
