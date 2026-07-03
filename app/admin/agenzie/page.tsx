import Link from "next/link";
import { getAgenzieConPortfolio } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default async function AgenzieListPage() {
  const agenzie = await getAgenzieConPortfolio();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Agenzie</h1>
        <p className="mt-1 text-sm text-slate-500">Elenco delle agenzie affiliate a LOQO</p>
      </div>

      <Card className="p-0">
        {agenzie.length === 0 ? (
          <EmptyState message="Nessuna agenzia registrata." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Ragione sociale</TableHeaderCell>
                <TableHeaderCell>Partita IVA</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Immobili</TableHeaderCell>
                <TableHeaderCell>Contratti</TableHeaderCell>
                <TableHeaderCell>Canoni mensili attivi</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agenzie.map((agenzia) => (
                <TableRow key={agenzia.id}>
                  <TableCell>
                    <Link href={`/admin/agenzie/${agenzia.id}`} className="font-medium text-slate-900 hover:underline">
                      {agenzia.ragioneSociale}
                    </Link>
                  </TableCell>
                  <TableCell>{agenzia.piva}</TableCell>
                  <TableCell>{agenzia.email}</TableCell>
                  <TableCell>{agenzia.numeroImmobili}</TableCell>
                  <TableCell>{agenzia.numeroContratti}</TableCell>
                  <TableCell>{formatCurrency(agenzia.canoniMensiliAttivi)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
