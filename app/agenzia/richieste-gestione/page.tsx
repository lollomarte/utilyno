import { requireAgenzia } from "@/lib/auth-helpers";
import { getRichiesteGestionePerAgenzia } from "@/lib/data/agenzia";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoRichiestaGestioneBadge } from "@/components/ui/badge";
import { RichiestaGestioneButtons } from "@/components/agenzia/richiesta-gestione-buttons";
import { formatDate } from "@/lib/utils";
import { STATO_RICHIESTA_GESTIONE_LABELS } from "@/lib/labels";

export default async function RichiesteGestionePage() {
  const { agenzia } = await requireAgenzia();
  const richieste = await getRichiesteGestionePerAgenzia(agenzia.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Richieste di gestione</h1>
        <p className="mt-1 text-sm text-slate-500">
          Proprietari che vogliono affidarti la gestione di un immobile per la messa a rendita
        </p>
      </div>

      <Card className="p-0">
        {richieste.length === 0 ? (
          <EmptyState message="Nessuna richiesta di gestione ricevuta." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Proprietario</TableHeaderCell>
                <TableHeaderCell>Messaggio</TableHeaderCell>
                <TableHeaderCell>Ricevuta il</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
                <TableHeaderCell>{""}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {richieste.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.immobile.indirizzo}, {r.immobile.comune}
                  </TableCell>
                  <TableCell>
                    {r.proprietario.user.nome} {r.proprietario.user.cognome}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-slate-500">{r.messaggio || "-"}</TableCell>
                  <TableCell>{formatDate(r.dataRichiesta)}</TableCell>
                  <TableCell>
                    <StatoRichiestaGestioneBadge stato={r.stato} label={STATO_RICHIESTA_GESTIONE_LABELS[r.stato]} />
                  </TableCell>
                  <TableCell>{r.stato === "IN_ATTESA" && <RichiestaGestioneButtons richiestaId={r.id} />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
