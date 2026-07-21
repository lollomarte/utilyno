import { requireProprietario } from "@/lib/auth-helpers";
import { ProfiloContent } from "@/components/layout/profilo-content";
import { DatiProprietarioForm } from "@/components/proprietario/dati-proprietario-form";
import { Card, CardHeader } from "@/components/ui/card";

export default async function ProfiloPage() {
  const { session, proprietario } = await requireProprietario();
  return (
    <div className="space-y-6">
      <ProfiloContent nome={session.user.nome} cognome={session.user.cognome} role={session.user.role} />
      <Card>
        <CardHeader title="Dati proprietario" description="Indirizzo e IBAN per accredito canoni e depositi" />
        <DatiProprietarioForm proprietario={proprietario} />
      </Card>
    </div>
  );
}
