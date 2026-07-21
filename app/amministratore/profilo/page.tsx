import { requireAmministratore } from "@/lib/auth-helpers";
import { ProfiloContent } from "@/components/layout/profilo-content";
import { DatiAmministratoreForm } from "@/components/amministratore/dati-amministratore-form";
import { Card, CardHeader } from "@/components/ui/card";

export default async function ProfiloPage() {
  const { session, amministratore } = await requireAmministratore();
  return (
    <div className="space-y-6">
      <ProfiloContent nome={session.user.nome} cognome={session.user.cognome} role={session.user.role} />
      <Card>
        <CardHeader title="Dati amministratore" description="Ragione sociale, contatti e dati per fatturazione" />
        <DatiAmministratoreForm amministratore={amministratore} />
      </Card>
    </div>
  );
}
