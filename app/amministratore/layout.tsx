import { requireAmministratore } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/amministratore", label: "Dashboard" },
  { href: "/amministratore/condomini", label: "Condomini" },
  { href: "/amministratore/segnalazioni", label: "Segnalazioni" },
  { href: "/amministratore/comunicazioni", label: "Comunicazioni" },
  { href: "/amministratore/documenti", label: "Documenti" },
];

export default async function AmministratoreLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requireAmministratore();

  return (
    <PortalShell
      portalLabel="Portale Amministratore"
      roleLabel="Amministratore di condominio"
      navItems={NAV_ITEMS}
      nome={session.user.nome}
      cognome={session.user.cognome}
      userId={session.user.id}
      role={session.user.role}
    >
      {children}
    </PortalShell>
  );
}
