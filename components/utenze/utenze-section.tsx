import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { StatoUtenzaBadge } from "@/components/ui/badge";
import { AttivaUtenzaButton } from "@/components/utenze/attiva-utenza-button";
import { formatDate } from "@/lib/utils";
import { TIPO_UTENZA_LABELS, STATO_UTENZA_LABELS } from "@/lib/labels";
import type { UtenzaRigaCompleta } from "@/lib/data/utenze";

export function UtenzeSection({
  immobileId,
  utenze,
  fornitoriPerTipo,
  readOnly = false,
}: {
  immobileId: string;
  utenze: UtenzaRigaCompleta[];
  fornitoriPerTipo: Partial<Record<UtenzaRigaCompleta["tipo"], string[]>>;
  readOnly?: boolean;
}) {
  return (
    <Card>
      <CardHeader title="Utenze" description="Stato delle utenze collegate all'immobile" />
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Tipo</TableHeaderCell>
            <TableHeaderCell>Fornitore</TableHeaderCell>
            <TableHeaderCell>Data attivazione</TableHeaderCell>
            <TableHeaderCell>Stato</TableHeaderCell>
            <TableHeaderCell>{""}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {utenze.map((u) => (
            <TableRow key={u.tipo}>
              <TableCell>{TIPO_UTENZA_LABELS[u.tipo]}</TableCell>
              <TableCell>{u.fornitore ?? "-"}</TableCell>
              <TableCell>{u.dataAttivazione ? formatDate(u.dataAttivazione) : "-"}</TableCell>
              <TableCell>
                <StatoUtenzaBadge stato={u.stato} label={STATO_UTENZA_LABELS[u.stato]} />
              </TableCell>
              <TableCell>
                {!readOnly && u.stato === "DA_ATTIVARE" && (
                  <AttivaUtenzaButton immobileId={immobileId} tipo={u.tipo} fornitoriDisponibili={fornitoriPerTipo[u.tipo] ?? []} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
