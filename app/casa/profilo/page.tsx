import { requirePrivato } from "@/lib/auth-helpers";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";
import { ProfiloContent } from "@/components/layout/profilo-content";
import { DiventaProprietarioForm } from "@/components/immobili/diventa-proprietario-form";
import { Card, CardHeader } from "@/components/ui/card";

const NAV_ITEMS: NavItem[] = [{ href: "/casa", label: "I miei immobili" }];

export default async function CasaProfiloPage() {
  const { session } = await requirePrivato();

  const profili = session.user.profili.filter(
    (p): p is "PROPRIETARIO" | "INQUILINO" => p === "PROPRIETARIO" || p === "INQUILINO"
  );
  const haDoppioProfilo = profili.length === 2;
  const roleLabel = haDoppioProfilo ? "Proprietario e Inquilino" : profili[0] === "PROPRIETARIO" ? "Proprietario" : "Inquilino";

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
      <div className="space-y-6">
        <ProfiloContent
          nome={session.user.nome}
          cognome={session.user.cognome}
          role={session.user.role}
          roleLabel={haDoppioProfilo ? "Proprietario e Inquilino" : undefined}
        />

        {!profili.includes("PROPRIETARIO") && (
          <Card>
            <CardHeader
              title="Diventa anche Proprietario"
              description="Hai anche un immobile di tua proprietà? Attiva il profilo Proprietario sullo stesso account."
            />
            <DiventaProprietarioForm />
          </Card>
        )}
      </div>
    </PortalShell>
  );
}
