import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoPagamentoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATO_PAGAMENTO_LABELS } from "@/lib/labels";

export interface RigaPagamentoInRitardo {
  id: string;
  importo: number;
  dataScadenza: Date;
  stato: "IN_RITARDO" | "INSOLUTO";
  immobile: string;
  inquilino: string;
}

export function PagamentiInRitardoList({
  righe,
  description,
}: {
  righe: RigaPagamentoInRitardo[];
  description?: string;
}) {
  return (
    <Card>
      <CardHeader title="Pagamenti in ritardo" description={description ?? "Canoni scaduti non ancora saldati"} />
      {righe.length === 0 ? (
        <EmptyState message="Nessun pagamento in ritardo al momento." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Immobile</TableHeaderCell>
              <TableHeaderCell>Inquilino</TableHeaderCell>
              <TableHeaderCell>Scadenza</TableHeaderCell>
              <TableHeaderCell>Importo</TableHeaderCell>
              <TableHeaderCell>Stato</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {righe.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.immobile}</TableCell>
                <TableCell>{r.inquilino}</TableCell>
                <TableCell>{formatDate(r.dataScadenza)}</TableCell>
                <TableCell>{formatCurrency(r.importo)}</TableCell>
                <TableCell>
                  <StatoPagamentoBadge stato={r.stato} label={STATO_PAGAMENTO_LABELS[r.stato]} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
