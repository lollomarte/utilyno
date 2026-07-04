import { getInvitoDetail } from "@/lib/data/invito";
import { CompletaInvitoForm } from "@/components/invito/completa-invito-form";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function InvitoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invito = await getInvitoDetail(token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold tracking-tight text-ink">LOQO</span>
          <p className="mt-1 text-sm text-slate-500">Attivazione account inquilino</p>
        </div>

        {!invito ? (
          <Card>
            <CardHeader title="Link non valido" description="Questo link di invito non esiste o non è più valido." />
          </Card>
        ) : invito.usatoAt ? (
          <Card>
            <CardHeader title="Invito già utilizzato" description="Questo account è già stato attivato. Accedi con le tue credenziali." />
          </Card>
        ) : invito.scadenza < new Date() ? (
          <Card>
            <CardHeader title="Invito scaduto" description="Questo link non è più valido. Contatta la tua agenzia per riceverne uno nuovo." />
          </Card>
        ) : (
          <Card>
            <CardHeader
              title={`Benvenuto/a ${invito.inquilino.user.nome}`}
              description="Completa l'attivazione del tuo account per accedere al contratto"
            />
            <DescriptionList
              items={[
                { label: "Immobile", value: `${invito.contratto.immobile.indirizzo}, ${invito.contratto.immobile.comune}` },
                { label: "Agenzia", value: invito.contratto.agenzia.ragioneSociale },
                { label: "Canone mensile", value: formatCurrency(invito.contratto.canoneMensile) },
                { label: "Periodo", value: `${formatDate(invito.contratto.dataInizio)} - ${formatDate(invito.contratto.dataFine)}` },
              ]}
            />
            <div className="mt-6 border-t border-slate-200 pt-6">
              <CompletaInvitoForm token={token} email={invito.inquilino.user.email} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
