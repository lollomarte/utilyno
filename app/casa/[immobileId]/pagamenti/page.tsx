import { addDays } from "date-fns";
import { notFound } from "next/navigation";
import { requirePrivato } from "@/lib/auth-helpers";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import { getContestoImmobile } from "@/lib/immobili/getImmobiliUtente";
import { getPagamentiPerProprietario, getContrattiForProprietario, getDepositiDaRestituire } from "@/lib/data/proprietario";
import { getContrattoPerImmobileInquilino } from "@/lib/data/inquilino";
import { GestisciRestituzioneDepositoButton } from "@/components/depositi/gestisci-restituzione-deposito-button";
import { calcolaInteressiLegali } from "@/lib/depositi/calcolaInteressiLegali";
import { PagaOraButton } from "@/components/inquilino/paga-ora-button";
import { PagamentiInRitardoBanner } from "@/components/pagamenti/pagamenti-in-ritardo-banner";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoPagamentoBadge, StatoDepositoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATO_PAGAMENTO_LABELS, STATO_DEPOSITO_LABELS } from "@/lib/labels";

export default async function ImmobilePagamentiPage({ params }: { params: Promise<{ immobileId: string }> }) {
  const { immobileId } = await params;
  const { session } = await requirePrivato();
  const contesto = await getContestoImmobile(session.user.id, immobileId);
  if (!contesto) notFound();

  await aggiornaPagamentiScaduti();

  if (contesto.relazione === "PROPRIETARIO") {
    const [pagamenti, contratti, depositiDaRestituire] = await Promise.all([
      getPagamentiPerProprietario(contesto.proprietarioId, immobileId),
      getContrattiForProprietario(contesto.proprietarioId, immobileId),
      getDepositiDaRestituire(contesto.proprietarioId, immobileId),
    ]);
    const depositiVersati = contratti.filter((c) => c.depositoStato !== "NON_VERSATO");

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-ink">Pagamenti e Depositi</h1>
          <p className="mt-1 text-sm text-slate-500">Storico incassi e stato del deposito cauzionale su questo immobile</p>
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
                  <TableHeaderCell>Importo</TableHeaderCell>
                  <TableHeaderCell>Stato</TableHeaderCell>
                  <TableHeaderCell>Interessi legali maturati</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {depositiVersati.map((contratto) => (
                  <TableRow key={contratto.id}>
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
            <CardHeader title="Storico pagamenti" description="Tutti i pagamenti su questo immobile" />
          </div>
          {pagamenti.length === 0 ? (
            <EmptyState message="Nessun pagamento registrato." />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
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

  const contratto = await getContrattoPerImmobileInquilino(contesto.inquilinoId, immobileId);
  if (!contratto) notFound();

  const pagamentiInRitardoCount = contratto.pagamenti.filter((p) => p.stato === "IN_RITARDO" || p.stato === "INSOLUTO").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Pagamenti</h1>
        <p className="mt-1 text-sm text-slate-500">
          Storico canoni per {contratto.immobile.indirizzo}, {contratto.immobile.comune}
        </p>
      </div>

      <PagamentiInRitardoBanner count={pagamentiInRitardoCount} />

      <Card className="p-0" id="storico-pagamenti">
        <div className="p-6 pb-0">
          <CardHeader title="Storico pagamenti" />
        </div>
        {contratto.pagamenti.length === 0 ? (
          <EmptyState message="Nessun pagamento registrato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Scadenza</TableHeaderCell>
                <TableHeaderCell>Importo</TableHeaderCell>
                <TableHeaderCell>Data pagamento</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
                <TableHeaderCell>{""}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contratto.pagamenti.map((p) => {
                const inScadenzaOImminente = p.stato !== "PROGRAMMATO" || p.dataScadenza <= addDays(new Date(), 7);
                const pagabile = p.stato !== "PAGATO" && inScadenzaOImminente;
                return (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.dataScadenza)}</TableCell>
                    <TableCell>{formatCurrency(p.importo)}</TableCell>
                    <TableCell>{p.dataPagamento ? formatDate(p.dataPagamento) : "-"}</TableCell>
                    <TableCell>
                      <StatoPagamentoBadge stato={p.stato} label={STATO_PAGAMENTO_LABELS[p.stato]} />
                    </TableCell>
                    <TableCell>
                      {pagabile && (
                        <PagaOraButton
                          pagamentoId={p.id}
                          importo={p.importo}
                          indirizzo={`${contratto.immobile.indirizzo}, ${contratto.immobile.comune}`}
                          dataScadenza={p.dataScadenza}
                        />
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
