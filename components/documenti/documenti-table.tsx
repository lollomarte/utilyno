import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export interface DocumentoRigaLista {
  id: string;
  nome: string;
  uploadedAt: Date;
  scadenzaAutoEliminazione: Date | null;
  caricatoDa: { nome: string; cognome: string };
  immobile: { indirizzo: string; comune: string } | null;
  contratto: { immobile: { indirizzo: string; comune: string } } | null;
  condominio: { nome: string } | null;
  condivisioni: { user: { nome: string; cognome: string } }[];
}

function contestoLabel(doc: DocumentoRigaLista): string {
  const immobile = doc.immobile ?? doc.contratto?.immobile;
  if (immobile) return `${immobile.indirizzo}, ${immobile.comune}`;
  if (doc.condominio) return doc.condominio.nome;
  return "-";
}

export function DocumentiTable({ documenti }: { documenti: DocumentoRigaLista[] }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Nome</TableHeaderCell>
          <TableHeaderCell>Collegato a</TableHeaderCell>
          <TableHeaderCell>Caricato da</TableHeaderCell>
          <TableHeaderCell>Condiviso con</TableHeaderCell>
          <TableHeaderCell>Scadenza</TableHeaderCell>
          <TableHeaderCell>{""}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {documenti.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium text-ink">{doc.nome}</TableCell>
            <TableCell>{contestoLabel(doc)}</TableCell>
            <TableCell>
              {doc.caricatoDa.nome} {doc.caricatoDa.cognome}
            </TableCell>
            <TableCell>
              {doc.condivisioni.length === 0
                ? "Solo tu"
                : doc.condivisioni.map((c) => `${c.user.nome} ${c.user.cognome}`).join(", ")}
            </TableCell>
            <TableCell>{doc.scadenzaAutoEliminazione ? formatDate(doc.scadenzaAutoEliminazione) : "-"}</TableCell>
            <TableCell>
              <a href={`/api/documenti/${doc.id}/download`} className="font-medium text-ink hover:underline">
                Scarica
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
