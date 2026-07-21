import { requireAgenzia } from "@/lib/auth-helpers";
import { ProfiloContent } from "@/components/layout/profilo-content";
import { DatiAgenziaForm } from "@/components/agenzia/dati-agenzia-form";
import { Card, CardHeader } from "@/components/ui/card";

export default async function ProfiloPage() {
  const { session, agenzia } = await requireAgenzia();
  return (
    <div className="space-y-6">
      <ProfiloContent nome={session.user.nome} cognome={session.user.cognome} role={session.user.role} />
      <Card>
        <CardHeader title="Dati agenzia" description="Ragione sociale, contatti e dati per fatturazione" />
        <DatiAgenziaForm agenzia={agenzia} />
      </Card>
    </div>
  );
}
