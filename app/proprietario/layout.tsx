import { requireProprietario } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/proprietario", label: "Dashboard" },
  { href: "/proprietario/immobili", label: "Immobili" },
  { href: "/proprietario/contratti", label: "Contratti" },
  { href: "/proprietario/pagamenti", label: "Pagamenti e Depositi" },
  { href: "/proprietario/segnalazioni", label: "Segnalazioni" },
  { href: "/proprietario/documenti", label: "Documenti" },
];

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
