import { requireInquilino } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/inquilino", label: "Dashboard" },
  { href: "/inquilino/contratto", label: "Contratto" },
  { href: "/inquilino/pagamenti", label: "Pagamenti" },
  { href: "/inquilino/utenze", label: "Utenze" },
  { href: "/inquilino/segnalazioni", label: "Segnalazioni" },
  { href: "/inquilino/checklist", label: "Checklist" },
  { href: "/inquilino/documenti", label: "Documenti" },
  { href: "/inquilino/note-sviluppatore", label: "Note per lo sviluppatore" },
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
      userId={session.user.id}
      profili={session.user.profili.filter((p): p is "PROPRIETARIO" | "INQUILINO" => p === "PROPRIETARIO" || p === "INQUILINO")}
    >
      {children}
    </PortalShell>
  );
}
