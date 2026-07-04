import Link from "next/link";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { StatoSegnalazioneBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { STATO_SEGNALAZIONE_LABELS } from "@/lib/labels";
import type { StatoSegnalazione } from "@prisma/client";

export interface SegnalazioneRigaLista {
  id: string;
  titolo: string;
  priorita: string;
  stato: StatoSegnalazione;
  createdAt: Date;
  creatoDa: { nome: string; cognome: string };
  immobile?: { indirizzo: string; comune: string };
  _count: { risposte: number };
  nonLetta?: boolean;
}

export function SegnalazioniTable({
  segnalazioni,
  basePath,
  showImmobile = true,
}: {
  segnalazioni: SegnalazioneRigaLista[];
  basePath: string;
  showImmobile?: boolean;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Titolo</TableHeaderCell>
          {showImmobile && <TableHeaderCell>Immobile</TableHeaderCell>}
          <TableHeaderCell>Creata da</TableHeaderCell>
          <TableHeaderCell>Data</TableHeaderCell>
          <TableHeaderCell>Priorità</TableHeaderCell>
          <TableHeaderCell>Risposte</TableHeaderCell>
          <TableHeaderCell>Stato</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {segnalazioni.map((s) => (
          <TableRow key={s.id}>
            <TableCell>
              <Link href={`${basePath}/${s.id}`} className="inline-flex items-center gap-2 font-medium text-ink hover:underline">
                {s.nonLetta && <span className="h-2 w-2 shrink-0 rounded-full bg-info" aria-label="Non letta" />}
                {s.titolo}
              </Link>
            </TableCell>
            {showImmobile && s.immobile && (
              <TableCell>
                {s.immobile.indirizzo}, {s.immobile.comune}
              </TableCell>
            )}
            <TableCell>
              {s.creatoDa.nome} {s.creatoDa.cognome}
            </TableCell>
            <TableCell>{formatDate(s.createdAt)}</TableCell>
            <TableCell>{s.priorita}</TableCell>
            <TableCell>{s._count.risposte}</TableCell>
            <TableCell>
              <StatoSegnalazioneBadge stato={s.stato} label={STATO_SEGNALAZIONE_LABELS[s.stato]} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
