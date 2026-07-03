import { requireInquilino } from "@/lib/auth-helpers";
import { getContrattoAttivoForInquilino, getUtenzeForImmobile } from "@/lib/data/inquilino";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoPagamentoBadge, StatoUtenzaBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TIPO_CONTRATTO_LABELS,
  REGIME_FISCALE_LABELS,
  STATO_PAGAMENTO_LABELS,
  TIPO_UTENZA_LABELS,
  STATO_UTENZA_LABELS,
} from "@/lib/labels";

export default async function InquilinoDashboardPage() {
  const { inquilino } = await requireInquilino();
  const contratto = await getContrattoAttivoForInquilino(inquilino.id);

  if (!contratto) {
    return (
      <Card>
        <CardHeader title="Nessun contratto attivo" description="Non risulta al momento un contratto di locazione attivo." />
      </Card>
    );
  }

  const utenze = await getUtenzeForImmobile(contratto.immobileId);
  const prossimaScadenza = contratto.pagamenti
    .filter((p) => p.stato === "PROGRAMMATO" || p.stato === "IN_RITARDO")
    .sort((a, b) => a.dataScadenza.getTime() - b.dataScadenza.getTime())[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Il tuo contratto</h1>
        <p className="mt-1 text-sm text-slate-500">
          {contratto.immobile.indirizzo}, {contratto.immobile.comune}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Canone mensile" value={formatCurrency(contratto.canoneMensile)} />
        <StatCard
          label="Prossima scadenza"
          value={prossimaScadenza ? formatDate(prossimaScadenza.dataScadenza) : "-"}
          tone={prossimaScadenza?.stato === "IN_RITARDO" ? "danger" : "default"}
          hint={prossimaScadenza ? formatCurrency(prossimaScadenza.importo) : undefined}
        />
        <StatCard label="Scadenza contratto" value={formatDate(contratto.dataFine)} />
      </div>

      <Card>
        <CardHeader title="Dati contratto" />
        <DescriptionList
          items={[
            { label: "Tipo contratto", value: TIPO_CONTRATTO_LABELS[contratto.tipoContratto] },
            { label: "Regime fiscale", value: REGIME_FISCALE_LABELS[contratto.regimeFiscale] },
            { label: "Agenzia", value: contratto.agenzia.ragioneSociale },
            { label: "Periodo", value: `${formatDate(contratto.dataInizio)} - ${formatDate(contratto.dataFine)}` },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Storico pagamenti" />
        {contratto.pagamenti.length === 0 ? (
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
              {contratto.pagamenti.map((p) => (
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
        <CardHeader title="Utenze" />
        {utenze.length === 0 ? (
          <EmptyState message="Nessuna utenza registrata." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Fornitore</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {utenze.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{TIPO_UTENZA_LABELS[u.tipo]}</TableCell>
                  <TableCell>{u.fornitore}</TableCell>
                  <TableCell>
                    <StatoUtenzaBadge stato={u.stato} label={STATO_UTENZA_LABELS[u.stato]} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
