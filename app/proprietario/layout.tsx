import { requireProprietario } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";

const NAV_ITEMS = [{ href: "/proprietario", label: "Dashboard" }];

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
