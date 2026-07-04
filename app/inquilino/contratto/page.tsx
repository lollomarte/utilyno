import { requireInquilino } from "@/lib/auth-helpers";
import { getContrattoAttivoForInquilino } from "@/lib/data/inquilino";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { StatoDepositoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TIPO_CONTRATTO_LABELS, REGIME_FISCALE_LABELS, STATO_DEPOSITO_LABELS } from "@/lib/labels";

export default async function InquilinoContrattoPage() {
  const { inquilino } = await requireInquilino();
  const contratto = await getContrattoAttivoForInquilino(inquilino.id);

  if (!contratto) {
    return (
      <Card>
        <CardHeader title="Nessun contratto attivo" description="Non risulta al momento un contratto di locazione attivo." />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Il tuo contratto</h1>
        <p className="mt-1 text-sm text-slate-500">
          {contratto.immobile.indirizzo}, {contratto.immobile.comune}
        </p>
      </div>

      <Card>
        <CardHeader title="Dati contratto" />
        <DescriptionList
          items={[
            { label: "Tipo contratto", value: TIPO_CONTRATTO_LABELS[contratto.tipoContratto] },
            { label: "Regime fiscale", value: REGIME_FISCALE_LABELS[contratto.regimeFiscale] },
            { label: "Agenzia", value: contratto.agenzia.ragioneSociale },
            { label: "Canone mensile", value: formatCurrency(contratto.canoneMensile) },
            { label: "Periodo", value: `${formatDate(contratto.dataInizio)} - ${formatDate(contratto.dataFine)}` },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Deposito cauzionale" />
        <DescriptionList
          items={[
            { label: "Importo", value: formatCurrency(contratto.depositoImporto) },
            {
              label: "Stato",
              value: <StatoDepositoBadge stato={contratto.depositoStato} label={STATO_DEPOSITO_LABELS[contratto.depositoStato]} />,
            },
            { label: "Interessi legali maturati", value: formatCurrency(contratto.interessiLegaliMaturati) },
            {
              label: "Data restituzione",
              value: contratto.dataRestituzioneDeposito ? formatDate(contratto.dataRestituzioneDeposito) : "-",
            },
          ]}
        />
        {contratto.depositoStato === "IN_CONTESTAZIONE" && (
          <div className="mt-4 rounded-control bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
            <p className="font-medium">Il tuo deposito è momentaneamente bloccato per una contestazione.</p>
            {contratto.depositoNote && <p className="mt-1">{contratto.depositoNote}</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
