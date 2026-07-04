import { requireProprietario } from "@/lib/auth-helpers";
import { getDocumentiPerProprietario } from "@/lib/data/proprietario";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default async function ProprietarioDocumentiPage() {
  const { proprietario } = await requireProprietario();
  const documenti = await getDocumentiPerProprietario(proprietario.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Documenti</h1>
        <p className="mt-1 text-sm text-slate-500">Documenti collegati ai tuoi immobili e contratti</p>
      </div>

      <Card className="p-0">
        {documenti.length === 0 ? (
          <EmptyState message="Nessun documento disponibile." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Caricato il</TableHeaderCell>
                <TableHeaderCell>{""}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documenti.map((doc) => {
                const immobile = doc.immobile ?? doc.contratto?.immobile;
                return (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.nome}</TableCell>
                    <TableCell>{immobile ? `${immobile.indirizzo}, ${immobile.comune}` : "-"}</TableCell>
                    <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                    <TableCell>
                      <a href={doc.url} download className="font-medium text-slate-900 hover:underline">
                        Scarica
                      </a>
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
