import { notFound } from "next/navigation";
import { getAgenziaDetailForAdmin } from "@/lib/data/admin";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATO_CONTRATTO_LABELS, TIPO_CONTRATTO_LABELS } from "@/lib/labels";

export default async function AgenziaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agenzia = await getAgenziaDetailForAdmin(id);

  if (!agenzia) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">{agenzia.ragioneSociale}</h1>
        <p className="mt-1 text-sm text-slate-500">{agenzia.piva}</p>
      </div>

      <Card>
        <CardHeader title="Dati agenzia" />
        <DescriptionList
          items={[
            { label: "Ragione sociale", value: agenzia.ragioneSociale },
            { label: "Partita IVA", value: agenzia.piva },
            { label: "Indirizzo", value: agenzia.indirizzo },
            { label: "Email referente", value: agenzia.user.email },
            { label: "Telefono", value: agenzia.telefono ?? "-" },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Portfolio contratti" />
        {agenzia.contratti.length === 0 ? (
          <EmptyState message="Nessun contratto gestito da questa agenzia." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Inquilino</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Canone</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agenzia.contratti.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.immobile.indirizzo}, {c.immobile.comune}
                  </TableCell>
                  <TableCell>
                    {c.inquilino.user.nome} {c.inquilino.user.cognome}
                  </TableCell>
                  <TableCell>{TIPO_CONTRATTO_LABELS[c.tipoContratto]}</TableCell>
                  <TableCell>{formatCurrency(c.canoneMensile)}</TableCell>
                  <TableCell>{formatDate(c.dataFine)}</TableCell>
                  <TableCell>
                    <StatoContrattoBadge stato={c.stato} label={STATO_CONTRATTO_LABELS[c.stato]} />
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
