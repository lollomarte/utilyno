import { requirePrivato } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";

const NAV_ITEMS: NavItem[] = [{ href: "/casa", label: "I miei immobili" }];

export default async function CasaLayout({ children }: { children: React.ReactNode }) {
  const { session } = await requirePrivato();

  const profili = session.user.profili.filter((p): p is "PROPRIETARIO" | "INQUILINO" =>
    p === "PROPRIETARIO" || p === "INQUILINO"
  );
  const roleLabel = profili.length === 2 ? "Proprietario e Inquilino" : profili[0] === "PROPRIETARIO" ? "Proprietario" : "Inquilino";

  return (
    <PortalShell
      portalLabel="I miei immobili"
      roleLabel={roleLabel}
      navItems={NAV_ITEMS}
      nome={session.user.nome}
      cognome={session.user.cognome}
      userId={session.user.id}
      profili={profili}
    >
      {children}
    </PortalShell>
  );
}
