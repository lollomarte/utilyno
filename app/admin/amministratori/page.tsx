import Link from "next/link";
import { getAmministratoriConPortfolio } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";

export default async function AmministratoriPage() {
  const amministratori = await getAmministratoriConPortfolio();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Amministratori di condominio</h1>
        <p className="mt-1 text-sm text-slate-500">Tutti gli amministratori di condominio registrati sulla piattaforma</p>
      </div>

      <Card className="p-0">
        {amministratori.length === 0 ? (
          <EmptyState message="Nessun amministratore di condominio registrato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Amministratore</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Condomini gestiti</TableHeaderCell>
                <TableHeaderCell>Unità totali</TableHeaderCell>
                <TableHeaderCell>Segnalazioni</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {amministratori.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link href={`/admin/amministratori/${a.id}`} className="font-medium text-ink hover:underline">
                      {a.ragioneSociale}
                    </Link>
                  </TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>{a.numeroCondomini}</TableCell>
                  <TableCell>{a.unitaTotali}</TableCell>
                  <TableCell>{a.segnalazioniTotali}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
