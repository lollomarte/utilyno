"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoTicketBadge } from "@/components/ui/badge";
import { NuovoTicketForm } from "@/components/inquilino/nuovo-ticket-form";
import { formatDate } from "@/lib/utils";
import { STATO_TICKET_LABELS } from "@/lib/labels";
import type { StatoTicket } from "@prisma/client";

type Ticket = {
  id: string;
  titolo: string;
  createdAt: Date;
  priorita: string;
  stato: StatoTicket;
  immobile: { indirizzo: string; comune: string };
};

export function TicketPageClient({ ticket }: { ticket: Ticket[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Segnalazioni</h1>
          <p className="mt-1 text-sm text-slate-500">Consulta lo stato delle tue segnalazioni.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          Nuova segnalazione
        </Button>
      </div>

      <Card className="p-0">
        {ticket.length === 0 ? (
          <EmptyState
            message="Non hai ancora inviato segnalazioni."
            action={<Button onClick={() => setOpen(true)}>Nuova segnalazione</Button>}
          />
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

      <Modal open={open} onClose={() => setOpen(false)} title="Nuova segnalazione">
        <NuovoTicketForm onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
