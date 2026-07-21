import { requireAdmin } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/agenzie", label: "Agenzie" },
  { href: "/admin/amministratori", label: "Amministratori" },
  { href: "/admin/contratti", label: "Contratti" },
  { href: "/admin/depositi", label: "Depositi" },
  { href: "/admin/lead", label: "Lead e Partner" },
  { href: "/admin/documenti", label: "Documenti" },
  { href: "/admin/log", label: "Log azioni" },
  { href: "/admin/privacy", label: "Privacy account" },
  { href: "/admin/note-sviluppatore", label: "Note per lo sviluppatore" },
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
      userId={session.user.id}
    >
      {children}
    </PortalShell>
  );
}
