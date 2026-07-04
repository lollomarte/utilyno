import { addDays } from "date-fns";
import { requireInquilino } from "@/lib/auth-helpers";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import { getContrattoAttivoForInquilino } from "@/lib/data/inquilino";
import { PagaOraButton } from "@/components/inquilino/paga-ora-button";
import { PagamentiInRitardoBanner } from "@/components/pagamenti/pagamenti-in-ritardo-banner";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoPagamentoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATO_PAGAMENTO_LABELS } from "@/lib/labels";

export default async function InquilinoPagamentiPage() {
  const { inquilino } = await requireInquilino();
  await aggiornaPagamentiScaduti();
  const contratto = await getContrattoAttivoForInquilino(inquilino.id);

  if (!contratto) {
    return (
      <Card>
        <CardHeader title="Nessun contratto attivo" description="Non risulta al momento un contratto di locazione attivo." />
      </Card>
    );
  }

  const pagamentiInRitardoCount = contratto.pagamenti.filter(
    (p) => p.stato === "IN_RITARDO" || p.stato === "INSOLUTO"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Pagamenti</h1>
        <p className="mt-1 text-sm text-slate-500">Storico canoni per {contratto.immobile.indirizzo}, {contratto.immobile.comune}</p>
      </div>

      <PagamentiInRitardoBanner count={pagamentiInRitardoCount} />

      <Card className="p-0" id="storico-pagamenti">
        <div className="p-6 pb-0">
          <CardHeader title="Storico pagamenti" />
        </div>
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
                <TableHeaderCell>{""}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contratto.pagamenti.map((p) => {
                const inScadenzaOImminente = p.stato !== "PROGRAMMATO" || p.dataScadenza <= addDays(new Date(), 7);
                const pagabile = p.stato !== "PAGATO" && inScadenzaOImminente;
                return (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.dataScadenza)}</TableCell>
                    <TableCell>{formatCurrency(p.importo)}</TableCell>
                    <TableCell>{p.dataPagamento ? formatDate(p.dataPagamento) : "-"}</TableCell>
                    <TableCell>
                      <StatoPagamentoBadge stato={p.stato} label={STATO_PAGAMENTO_LABELS[p.stato]} />
                    </TableCell>
                    <TableCell>
                      {pagabile && (
                        <PagaOraButton
                          pagamentoId={p.id}
                          importo={p.importo}
                          indirizzo={`${contratto.immobile.indirizzo}, ${contratto.immobile.comune}`}
                          dataScadenza={p.dataScadenza}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
