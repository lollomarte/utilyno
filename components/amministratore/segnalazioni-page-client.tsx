"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { NuovaSegnalazioneForm } from "@/components/amministratore/nuova-segnalazione-form";
import { StatoSegnalazioneSelect } from "@/components/amministratore/stato-segnalazione-select";
import { formatDate } from "@/lib/utils";
import type { StatoSegnalazione } from "@prisma/client";

type Condominio = { id: string; nome: string; comune: string };
type Immobile = { id: string; indirizzo: string; condominioId: string | null; contratti: { id: string }[] };
type Segnalazione = {
  id: string;
  titolo: string;
  createdAt: Date;
  priorita: string;
  stato: StatoSegnalazione;
  immobileId: string | null;
  notificaInquilino: boolean;
  notificaProprietario: boolean;
  condominio: { nome: string };
};

function destinatariLabel(notificaInquilino: boolean, notificaProprietario: boolean, hasImmobile: boolean) {
  if (!hasImmobile) return "Generale";
  if (notificaInquilino && notificaProprietario) return "Inquilino + Proprietario";
  if (notificaInquilino) return "Inquilino";
  if (notificaProprietario) return "Proprietario";
  return "-";
}

export function SegnalazioniPageClient({
  segnalazioni,
  condomini,
  immobili,
}: {
  segnalazioni: Segnalazione[];
  condomini: Condominio[];
  immobili: Immobile[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Segnalazioni condominiali</h1>
          <p className="mt-1 text-sm text-slate-500">Gestisci problematiche, interventi e stato delle segnalazioni</p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          Nuova segnalazione
        </Button>
      </div>

      <Card className="p-0">
        {segnalazioni.length === 0 ? (
          <EmptyState
            message="Nessuna segnalazione al momento."
            action={<Button onClick={() => setOpen(true)}>Nuova segnalazione</Button>}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Titolo</TableHeaderCell>
                <TableHeaderCell>Condominio</TableHeaderCell>
                <TableHeaderCell>Destinatari</TableHeaderCell>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Priorità</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {segnalazioni.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.titolo}</TableCell>
                  <TableCell>{s.condominio.nome}</TableCell>
                  <TableCell>{destinatariLabel(s.notificaInquilino, s.notificaProprietario, !!s.immobileId)}</TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  <TableCell>{s.priorita}</TableCell>
                  <TableCell>
                    <StatoSegnalazioneSelect segnalazioneId={s.id} statoAttuale={s.stato} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuova segnalazione">
        <NuovaSegnalazioneForm condomini={condomini} immobili={immobili} onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
