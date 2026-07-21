import { requirePrivato } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";
import { ProfiloContent } from "@/components/layout/profilo-content";
import { DatiPrivatoForm } from "@/components/privato/dati-privato-form";
import { Card, CardHeader } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/labels";

const NAV_ITEMS: NavItem[] = [{ href: "/privato", label: "I miei immobili" }];

export default async function PrivatoProfiloPage() {
  const { session, privato } = await requirePrivato();

  return (
    <PortalShell
      portalLabel="I miei immobili"
      roleLabel={ROLE_LABELS.PRIVATO}
      navItems={NAV_ITEMS}
      nome={session.user.nome}
      cognome={session.user.cognome}
      userId={session.user.id}
    >
      <div className="space-y-6">
        <ProfiloContent nome={session.user.nome} cognome={session.user.cognome} role={session.user.role} />

        <Card>
          <CardHeader title="I tuoi dati" description="Anagrafica e dati per accredito canoni e depositi" />
          <DatiPrivatoForm privato={privato} />
        </Card>
      </div>
    </PortalShell>
  );
}
