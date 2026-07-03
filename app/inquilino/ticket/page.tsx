import { requireInquilino } from "@/lib/auth-helpers";
import { getTicketForInquilino } from "@/lib/data/inquilino";
import { NuovoTicketForm } from "@/components/inquilino/nuovo-ticket-form";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoTicketBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { STATO_TICKET_LABELS } from "@/lib/labels";

export default async function TicketPage() {
  const { inquilino } = await requireInquilino();
  const ticket = await getTicketForInquilino(inquilino.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Segnalazioni</h1>
        <p className="mt-1 text-sm text-slate-500">Invia una nuova segnalazione o consulta lo stato delle precedenti.</p>
      </div>

      <NuovoTicketForm />

      <Card>
        <CardHeader title="Le tue segnalazioni" />
        {ticket.length === 0 ? (
          <EmptyState message="Non hai ancora inviato segnalazioni." />
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
              {ticket.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.titolo}</TableCell>
                  <TableCell>
                    {t.immobile.indirizzo}, {t.immobile.comune}
                  </TableCell>
                  <TableCell>{formatDate(t.createdAt)}</TableCell>
                  <TableCell>{t.priorita}</TableCell>
                  <TableCell>
                    <StatoTicketBadge stato={t.stato} label={STATO_TICKET_LABELS[t.stato]} />
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
