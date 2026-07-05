import { differenceInCalendarDays } from "date-fns";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";
import { StatoAssicurazioneBadge, Badge } from "@/components/ui/badge";
import { AttivaAssicurazioneButton } from "@/components/assicurazioni/attiva-assicurazione-button";
import { RinnovaAssicurazioneButton } from "@/components/assicurazioni/rinnova-assicurazione-button";
import { formatCurrency, formatDate, countdownScadenza } from "@/lib/utils";
import { STATO_ASSICURAZIONE_LABELS } from "@/lib/labels";

/** Sotto questa soglia di giorni alla scadenza compare l'azione "Rinnova". */
const GIORNI_SOGLIA_RINNOVO = 60;

export interface AssicurazioneRow {
  id: string;
  tipo: string;
  fornitore: string;
  premioAnnuale: number;
  stato: string;
  dataScadenza: Date;
}

export function AssicurazioneSection({
  immobileId,
  assicurazione,
  fornitoriDisponibili,
}: {
  immobileId: string;
  assicurazione: AssicurazioneRow | null;
  fornitoriDisponibili: string[];
}) {
  if (!assicurazione) {
    return (
      <Card>
        <CardHeader title="Assicurazione" description="Nessuna copertura assicurativa attiva su questo immobile" />
        <EmptyState message="Nessuna copertura attiva." action={<AttivaAssicurazioneButton immobileId={immobileId} fornitoriDisponibili={fornitoriDisponibili} />} />
      </Card>
    );
  }

  const { label, tone } = countdownScadenza(assicurazione.dataScadenza);
  const giorniAllaScadenza = differenceInCalendarDays(assicurazione.dataScadenza, new Date());
  const mostraRinnova = giorniAllaScadenza <= GIORNI_SOGLIA_RINNOVO;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardHeader title="Assicurazione" description="Copertura assicurativa collegata all'immobile" />
        <StatoAssicurazioneBadge stato={assicurazione.stato} label={STATO_ASSICURAZIONE_LABELS[assicurazione.stato]} />
      </div>
      <DescriptionList
        items={[
          { label: "Tipo di copertura", value: assicurazione.tipo },
          { label: "Fornitore", value: assicurazione.fornitore },
          { label: "Premio annuale", value: formatCurrency(assicurazione.premioAnnuale) },
          {
            label: "Scadenza",
            value: (
              <span className="inline-flex items-center gap-2">
                {formatDate(assicurazione.dataScadenza)}
                <Badge tone={tone}>{label}</Badge>
              </span>
            ),
          },
        ]}
      />
      {mostraRinnova && (
        <div className="mt-4">
          <RinnovaAssicurazioneButton
            assicurazioneId={assicurazione.id}
            premioAnnualeAttuale={assicurazione.premioAnnuale}
            dataScadenzaAttuale={assicurazione.dataScadenza}
          />
        </div>
      )}
    </Card>
  );
}
