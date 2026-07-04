import { requireAdmin } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/agenzie", label: "Agenzie" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requireAdmin();

  return (
    <PortalShell
      portalLabel="Portale Admin"
      roleLabel="Amministratore LOQO"
      navItems={NAV_ITEMS}
      nome={session.user.nome}
      cognome={session.user.cognome}
    >
      {children}
    </PortalShell>
  );
}
