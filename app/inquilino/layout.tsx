import { requireInquilino } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";

const NAV_ITEMS = [
  { href: "/inquilino", label: "Dashboard" },
  { href: "/inquilino/ticket", label: "Segnalazioni" },
];

export default async function InquilinoLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requireInquilino();

  return (
    <PortalShell
      portalLabel="Portale Inquilino"
      roleLabel="Inquilino"
      navItems={NAV_ITEMS}
      nome={session.user.nome}
      cognome={session.user.cognome}
    >
      {children}
    </PortalShell>
  );
}
