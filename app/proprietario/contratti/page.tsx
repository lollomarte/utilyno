import Link from "next/link";
import { requireProprietario } from "@/lib/auth-helpers";
import { getContrattiForProprietario } from "@/lib/data/proprietario";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATO_CONTRATTO_LABELS, TIPO_CONTRATTO_LABELS } from "@/lib/labels";

export default async function ProprietarioContrattiPage() {
  const { proprietario } = await requireProprietario();
  const contratti = await getContrattiForProprietario(proprietario.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Contratti</h1>
        <p className="mt-1 text-sm text-slate-500">Tutti i contratti, attuali e passati, sui tuoi immobili</p>
      </div>

      <Card className="p-0">
        {contratti.length === 0 ? (
          <EmptyState message="Nessun contratto registrato sui tuoi immobili." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Inquilino</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Canone</TableHeaderCell>
                <TableHeaderCell>Periodo</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contratti.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/proprietario/immobili/${c.immobile.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.immobile.indirizzo}, {c.immobile.comune}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {c.inquilino.user.nome} {c.inquilino.user.cognome}
                  </TableCell>
                  <TableCell>{TIPO_CONTRATTO_LABELS[c.tipoContratto]}</TableCell>
                  <TableCell>{formatCurrency(c.canoneMensile)}</TableCell>
                  <TableCell>
                    {formatDate(c.dataInizio)} - {formatDate(c.dataFine)}
                  </TableCell>
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
