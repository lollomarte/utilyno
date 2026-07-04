import { requireProprietario } from "@/lib/auth-helpers";
import { getSegnalazioniPerProprietario } from "@/lib/data/proprietario";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoSegnalazioneBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { STATO_SEGNALAZIONE_LABELS } from "@/lib/labels";

export default async function SegnalazioniPage() {
  const { proprietario } = await requireProprietario();
  const segnalazioni = await getSegnalazioniPerProprietario(proprietario.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Segnalazioni</h1>
        <p className="mt-1 text-sm text-slate-500">Segnalazioni condominiali relative ai tuoi immobili</p>
      </div>

      <Card className="p-0">
        {segnalazioni.length === 0 ? (
          <EmptyState message="Nessuna segnalazione al momento." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Titolo</TableHeaderCell>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Priorità</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {segnalazioni.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.titolo}</TableCell>
                  <TableCell>{s.immobile ? `${s.immobile.indirizzo}, ${s.immobile.comune}` : "-"}</TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  <TableCell>{s.priorita}</TableCell>
                  <TableCell>
                    <StatoSegnalazioneBadge stato={s.stato} label={STATO_SEGNALAZIONE_LABELS[s.stato]} />
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
