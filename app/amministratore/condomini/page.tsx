import Link from "next/link";
import { requireAmministratore } from "@/lib/auth-helpers";
import { getCondominiForAmministratore } from "@/lib/data/amministratore";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default async function CondominiPage() {
  const { amministratore } = await requireAmministratore();
  const condomini = await getCondominiForAmministratore(amministratore.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Condomini</h1>
          <p className="mt-1 text-sm text-slate-500">I condomini che gestisci</p>
        </div>
        <Link href="/amministratore/condomini/nuovo">
          <Button>Nuovo condominio</Button>
        </Link>
      </div>

      <Card className="p-0">
        {condomini.length === 0 ? (
          <EmptyState message="Nessun condominio registrato. Crea il primo condominio per iniziare." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Indirizzo</TableHeaderCell>
                <TableHeaderCell>Comune</TableHeaderCell>
                <TableHeaderCell>Unità</TableHeaderCell>
                <TableHeaderCell>Immobili collegati</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {condomini.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/amministratore/condomini/${c.id}`} className="font-medium text-ink hover:underline">
                      {c.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{c.indirizzo}</TableCell>
                  <TableCell>{c.comune}</TableCell>
                  <TableCell>{c.numeroUnita}</TableCell>
                  <TableCell>{c._count.immobili}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
