import { notFound } from "next/navigation";
import { requireProprietario } from "@/lib/auth-helpers";
import { getImmobileDetailForProprietario } from "@/lib/data/proprietario";
import { getUtenzeComplete, getFornitoriPerTutteLeUtenze } from "@/lib/data/utenze";
import { getFornitoriAssicurazione } from "@/lib/data/assicurazioni";
import { SegnalazioniTable } from "@/components/segnalazioni/segnalazioni-table";
import { UtenzeSection } from "@/components/utenze/utenze-section";
import { AssicurazioneSection } from "@/components/assicurazioni/assicurazione-section";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge, StatoPagamentoBadge, StatoDepositoBadge, StatoImmobileBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TIPO_IMMOBILE_LABELS,
  STATO_CONTRATTO_LABELS,
  STATO_PAGAMENTO_LABELS,
  STATO_DEPOSITO_LABELS,
  STATO_IMMOBILE_LABELS,
} from "@/lib/labels";

export default async function ImmobileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { proprietario } = await requireProprietario();
  const immobile = await getImmobileDetailForProprietario(id, proprietario.id);

  if (!immobile) {
    notFound();
  }

  const [utenze, fornitoriPerTipo, fornitoriAssicurazione] = await Promise.all([
    getUtenzeComplete(immobile.id),
    getFornitoriPerTutteLeUtenze(),
    getFornitoriAssicurazione(),
  ]);

  const contrattoAttivo = immobile.contratti.find((c) => c.stato === "ATTIVO");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {immobile.indirizzo}, {immobile.comune}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{TIPO_IMMOBILE_LABELS[immobile.tipoImmobile]}</p>
        </div>
        <StatoImmobileBadge stato={immobile.stato} label={STATO_IMMOBILE_LABELS[immobile.stato]} />
      </div>

      <Card>
        <CardHeader title="Dati immobile" />
        <DescriptionList
          items={[
            { label: "Indirizzo", value: `${immobile.indirizzo}, ${immobile.comune} (${immobile.provincia})` },
            { label: "Dati catastali", value: immobile.datiCatastali },
            { label: "Superficie", value: `${immobile.superficieMq} m²` },
            { label: "Classe APE", value: immobile.apeClasse ?? "-" },
            { label: "Valore stimato", value: formatCurrency(immobile.valoreStimato) },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Contratto attivo e deposito" />
        {!contrattoAttivo ? (
          <EmptyState message="Nessun contratto attivo su questo immobile." />
        ) : (
          <DescriptionList
            items={[
              { label: "Inquilino", value: `${contrattoAttivo.inquilino.user.nome} ${contrattoAttivo.inquilino.user.cognome}` },
              { label: "Canone mensile", value: formatCurrency(contrattoAttivo.canoneMensile) },
              { label: "Periodo", value: `${formatDate(contrattoAttivo.dataInizio)} - ${formatDate(contrattoAttivo.dataFine)}` },
              {
                label: "Stato contratto",
                value: <StatoContrattoBadge stato={contrattoAttivo.stato} label={STATO_CONTRATTO_LABELS[contrattoAttivo.stato]} />,
              },
              { label: "Importo deposito", value: formatCurrency(contrattoAttivo.depositoImporto) },
              {
                label: "Stato deposito",
                value: (
                  <StatoDepositoBadge stato={contrattoAttivo.depositoStato} label={STATO_DEPOSITO_LABELS[contrattoAttivo.depositoStato]} />
                ),
              },
              { label: "Interessi legali maturati", value: formatCurrency(contrattoAttivo.interessiLegaliMaturati) },
            ]}
          />
        )}
      </Card>

      <Card>
        <CardHeader title="Storico pagamenti ricevuti" />
        {immobile.contratti.flatMap((c) => c.pagamenti).length === 0 ? (
          <EmptyState message="Nessun pagamento registrato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Scadenza</TableHeaderCell>
                <TableHeaderCell>Importo</TableHeaderCell>
                <TableHeaderCell>Data pagamento</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {immobile.contratti
                .flatMap((c) => c.pagamenti)
                .sort((a, b) => b.dataScadenza.getTime() - a.dataScadenza.getTime())
                .map((p) => {
                  const inAttesaDiAccredito = p.stato === "PAGATO" && p.dataAccredito && p.dataAccredito > new Date();
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.dataScadenza)}</TableCell>
                      <TableCell>{formatCurrency(p.importo)}</TableCell>
                      <TableCell>{p.dataPagamento ? formatDate(p.dataPagamento) : "-"}</TableCell>
                      <TableCell>
                        <StatoPagamentoBadge stato={p.stato} label={STATO_PAGAMENTO_LABELS[p.stato]} />
                        {inAttesaDiAccredito && (
                          <p className="mt-1 text-xs text-slate-400">
                            Pagamento ricevuto, accredito previsto il {formatDate(p.dataAccredito!)}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        )}
      </Card>

      <UtenzeSection immobileId={immobile.id} utenze={utenze} fornitoriPerTipo={fornitoriPerTipo} />

      <AssicurazioneSection
        immobileId={immobile.id}
        assicurazione={immobile.assicurazioni[0] ?? null}
        fornitoriDisponibili={fornitoriAssicurazione}
      />

      <Card className="p-0">
        <div className="p-6 pb-0">
          <CardHeader title="Segnalazioni su questo immobile" />
        </div>
        {immobile.segnalazioni.length === 0 ? (
          <EmptyState message="Nessuna segnalazione per questo immobile." />
        ) : (
          <SegnalazioniTable segnalazioni={immobile.segnalazioni} basePath="/proprietario/segnalazioni" showImmobile={false} />
        )}
      </Card>
    </div>
  );
}
