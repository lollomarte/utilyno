import { notFound } from "next/navigation";
import { requireProprietario } from "@/lib/auth-helpers";
import { getImmobileDetailForProprietario } from "@/lib/data/proprietario";
import { SegnalazioniTable } from "@/components/segnalazioni/segnalazioni-table";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge, StatoPagamentoBadge, StatoDepositoBadge, StatoAssicurazioneBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TIPO_IMMOBILE_LABELS,
  STATO_CONTRATTO_LABELS,
  STATO_PAGAMENTO_LABELS,
  STATO_DEPOSITO_LABELS,
  STATO_ASSICURAZIONE_LABELS,
} from "@/lib/labels";

export default async function ImmobileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { proprietario } = await requireProprietario();
  const immobile = await getImmobileDetailForProprietario(id, proprietario.id);

  if (!immobile) {
    notFound();
  }

  const contrattoAttivo = immobile.contratti.find((c) => c.stato === "ATTIVO");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {immobile.indirizzo}, {immobile.comune}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{TIPO_IMMOBILE_LABELS[immobile.tipoImmobile]}</p>
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
                .map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.dataScadenza)}</TableCell>
                    <TableCell>{formatCurrency(p.importo)}</TableCell>
                    <TableCell>{p.dataPagamento ? formatDate(p.dataPagamento) : "-"}</TableCell>
                    <TableCell>
                      <StatoPagamentoBadge stato={p.stato} label={STATO_PAGAMENTO_LABELS[p.stato]} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Assicurazioni collegate" />
        {immobile.assicurazioni.length === 0 ? (
          <EmptyState message="Nessuna assicurazione attiva su questo immobile." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Fornitore</TableHeaderCell>
                <TableHeaderCell>Premio annuale</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {immobile.assicurazioni.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.tipo}</TableCell>
                  <TableCell>{a.fornitore}</TableCell>
                  <TableCell>{formatCurrency(a.premioAnnuale)}</TableCell>
                  <TableCell>{formatDate(a.dataScadenza)}</TableCell>
                  <TableCell>
                    <StatoAssicurazioneBadge stato={a.stato} label={STATO_ASSICURAZIONE_LABELS[a.stato]} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

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
