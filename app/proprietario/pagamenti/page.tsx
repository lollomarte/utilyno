import { requireProprietario } from "@/lib/auth-helpers";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import {
  getPagamentiPerProprietario,
  getContrattiForProprietario,
  getDepositiDaRestituire,
} from "@/lib/data/proprietario";
import { GestisciRestituzioneDepositoButton } from "@/components/depositi/gestisci-restituzione-deposito-button";
import { calcolaInteressiLegali } from "@/lib/depositi/calcolaInteressiLegali";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoPagamentoBadge, StatoDepositoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATO_PAGAMENTO_LABELS, STATO_DEPOSITO_LABELS } from "@/lib/labels";

export default async function ProprietarioPagamentiPage() {
  const { proprietario } = await requireProprietario();
  await aggiornaPagamentiScaduti();
  const [pagamenti, contratti, depositiDaRestituire] = await Promise.all([
    getPagamentiPerProprietario(proprietario.id),
    getContrattiForProprietario(proprietario.id),
    getDepositiDaRestituire(proprietario.id),
  ]);

  const depositiVersati = contratti.filter((c) => c.depositoStato !== "NON_VERSATO");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Pagamenti e Depositi</h1>
        <p className="mt-1 text-sm text-slate-500">Storico incassi e stato dei depositi cauzionali sui tuoi immobili</p>
      </div>

      <Card>
        <CardHeader title="Depositi da restituire" description="Contratti conclusi con deposito ancora da restituire all'inquilino" />
        {depositiDaRestituire.length === 0 ? (
          <EmptyState message="Nessun deposito in attesa di restituzione." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {depositiDaRestituire.map((contratto) => (
              <li key={contratto.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {contratto.immobile.indirizzo}, {contratto.immobile.comune}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {contratto.inquilino.user.nome} {contratto.inquilino.user.cognome} &middot; contratto concluso il{" "}
                    {formatDate(contratto.dataFine)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Deposito {formatCurrency(contratto.depositoImporto)} &middot;{" "}
                    <StatoDepositoBadge stato={contratto.depositoStato} label={STATO_DEPOSITO_LABELS[contratto.depositoStato]} />
                  </p>
                </div>
                <GestisciRestituzioneDepositoButton
                  contrattoId={contratto.id}
                  depositoImporto={contratto.depositoImporto}
                  interessiStimati={calcolaInteressiLegali(contratto.depositoImporto, contratto.dataInizio, contratto.dataFine)}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-0">
        <div className="p-6 pb-0">
          <CardHeader title="Depositi cauzionali" description="Stato del deposito per ogni contratto" />
        </div>
        {depositiVersati.length === 0 ? (
          <EmptyState message="Nessun deposito versato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Importo</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
                <TableHeaderCell>Interessi legali maturati</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {depositiVersati.map((contratto) => (
                <TableRow key={contratto.id}>
                  <TableCell>
                    {contratto.immobile.indirizzo}, {contratto.immobile.comune}
                  </TableCell>
                  <TableCell>{formatCurrency(contratto.depositoImporto)}</TableCell>
                  <TableCell>
                    <StatoDepositoBadge stato={contratto.depositoStato} label={STATO_DEPOSITO_LABELS[contratto.depositoStato]} />
                  </TableCell>
                  <TableCell>{formatCurrency(contratto.interessiLegaliMaturati)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="p-0">
        <div className="p-6 pb-0">
          <CardHeader title="Storico pagamenti" description="Tutti i pagamenti sui tuoi immobili" />
        </div>
        {pagamenti.length === 0 ? (
          <EmptyState message="Nessun pagamento registrato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
                <TableHeaderCell>Importo</TableHeaderCell>
                <TableHeaderCell>Data pagamento</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagamenti.map((p) => {
                const inAttesaDiAccredito = p.stato === "PAGATO" && p.dataAccredito && p.dataAccredito > new Date();
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.contratto.immobile.indirizzo}, {p.contratto.immobile.comune}
                    </TableCell>
                    <TableCell>{formatDate(p.dataScadenza)}</TableCell>
                    <TableCell>{formatCurrency(p.importo)}</TableCell>
                    <TableCell>{p.dataPagamento ? formatDate(p.dataPagamento) : "-"}</TableCell>
                    <TableCell>
                      <StatoPagamentoBadge stato={p.stato} label={STATO_PAGAMENTO_LABELS[p.stato]} />
                      {inAttesaDiAccredito && (
                        <p className="mt-1 text-xs text-slate-400">
                          Pagamento ricevuto, accredito previsto il {formatDate(p.dataAccredito!)}
                        </p>
                      )}
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
