import { addDays } from "date-fns";
import { Euro, CalendarClock, FileClock } from "lucide-react";
import { requireInquilino } from "@/lib/auth-helpers";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import { getContrattoAttivoForInquilino, getUtenzeForImmobile, getComunicazioniPerInquilino } from "@/lib/data/inquilino";
import { getSegnalazioniNonLette } from "@/lib/data/segnalazioni";
import { ComunicazioneItem } from "@/components/comunicazioni/comunicazione-item";
import { ChecklistItem } from "@/components/inquilino/checklist-item";
import { PagaOraButton } from "@/components/inquilino/paga-ora-button";
import { PagamentiInRitardoBanner } from "@/components/pagamenti/pagamenti-in-ritardo-banner";
import { SegnalazioniNonLetteBadge } from "@/components/segnalazioni/non-lette-badge";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoPagamentoBadge, StatoUtenzaBadge, StatoDepositoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TIPO_CONTRATTO_LABELS,
  REGIME_FISCALE_LABELS,
  STATO_PAGAMENTO_LABELS,
  TIPO_UTENZA_LABELS,
  STATO_UTENZA_LABELS,
  STATO_DEPOSITO_LABELS,
} from "@/lib/labels";

export default async function InquilinoDashboardPage() {
  const { session, inquilino } = await requireInquilino();
  await aggiornaPagamentiScaduti();
  const contratto = await getContrattoAttivoForInquilino(inquilino.id);

  if (!contratto) {
    return (
      <Card>
        <CardHeader title="Nessun contratto attivo" description="Non risulta al momento un contratto di locazione attivo." />
      </Card>
    );
  }

  const [utenze, comunicazioni, nonLette] = await Promise.all([
    getUtenzeForImmobile(contratto.immobileId),
    getComunicazioniPerInquilino(contratto.immobile.condominioId, session.user.id),
    getSegnalazioniNonLette(session.user.id),
  ]);
  const prossimaScadenza = contratto.pagamenti
    .filter((p) => p.stato === "PROGRAMMATO" || p.stato === "IN_RITARDO")
    .sort((a, b) => a.dataScadenza.getTime() - b.dataScadenza.getTime())[0];
  const pagamentiInRitardoCount = contratto.pagamenti.filter(
    (p) => p.stato === "IN_RITARDO" || p.stato === "INSOLUTO"
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Il tuo contratto</h1>
          <p className="mt-1 text-sm text-slate-500">
            {contratto.immobile.indirizzo}, {contratto.immobile.comune}
          </p>
        </div>
        <SegnalazioniNonLetteBadge count={nonLette} href="/inquilino/segnalazioni" />
      </div>

      <PagamentiInRitardoBanner count={pagamentiInRitardoCount} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Canone mensile" value={formatCurrency(contratto.canoneMensile)} icon={Euro} />
        <StatCard
          label="Prossima scadenza"
          value={prossimaScadenza ? formatDate(prossimaScadenza.dataScadenza) : "-"}
          tone={prossimaScadenza?.stato === "IN_RITARDO" ? "danger" : "default"}
          hint={prossimaScadenza ? formatCurrency(prossimaScadenza.importo) : undefined}
          icon={CalendarClock}
        />
        <StatCard label="Scadenza contratto" value={formatDate(contratto.dataFine)} icon={FileClock} />
      </div>

      <Card>
        <CardHeader title="Dati contratto" />
        <DescriptionList
          items={[
            { label: "Tipo contratto", value: TIPO_CONTRATTO_LABELS[contratto.tipoContratto] },
            { label: "Regime fiscale", value: REGIME_FISCALE_LABELS[contratto.regimeFiscale] },
            { label: "Agenzia", value: contratto.agenzia.ragioneSociale },
            { label: "Periodo", value: `${formatDate(contratto.dataInizio)} - ${formatDate(contratto.dataFine)}` },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Deposito cauzionale" />
        <DescriptionList
          items={[
            { label: "Importo", value: formatCurrency(contratto.depositoImporto) },
            {
              label: "Stato",
              value: <StatoDepositoBadge stato={contratto.depositoStato} label={STATO_DEPOSITO_LABELS[contratto.depositoStato]} />,
            },
            { label: "Interessi legali maturati", value: formatCurrency(contratto.interessiLegaliMaturati) },
            {
              label: "Data restituzione",
              value: contratto.dataRestituzioneDeposito ? formatDate(contratto.dataRestituzioneDeposito) : "-",
            },
          ]}
        />
        {contratto.depositoStato === "IN_CONTESTAZIONE" && (
          <div className="mt-4 rounded-control bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
            <p className="font-medium">Il tuo deposito è momentaneamente bloccato per una contestazione.</p>
            {contratto.depositoNote && <p className="mt-1">{contratto.depositoNote}</p>}
          </div>
        )}
      </Card>

      <Card id="storico-pagamenti">
        <CardHeader title="Storico pagamenti" />
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

      <Card>
        <CardHeader title="Utenze" />
        {utenze.length === 0 ? (
          <EmptyState message="Nessuna utenza registrata." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Fornitore</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {utenze.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{TIPO_UTENZA_LABELS[u.tipo]}</TableCell>
                  <TableCell>{u.fornitore}</TableCell>
                  <TableCell>
                    <StatoUtenzaBadge stato={u.stato} label={STATO_UTENZA_LABELS[u.stato]} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Checklist immobile" description="Conferma con la tua firma le checklist di ingresso e uscita" />
        {contratto.checklist.length === 0 ? (
          <EmptyState message="Nessuna checklist disponibile." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {contratto.checklist.map((c) => (
              <ChecklistItem
                key={c.id}
                id={c.id}
                tipo={c.tipo}
                note={c.note}
                fotoCount={c.fotoUrls.length}
                dataCompilazione={c.dataCompilazione}
                firmaInquilinoAt={c.firmaInquilinoAt}
                firmaProprietarioAt={c.firmaProprietarioAt}
              />
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Comunicazioni" description="Comunicazioni inviate dall'amministratore a tutto il condominio" />
        {comunicazioni.length === 0 ? (
          <EmptyState message="Nessuna comunicazione ricevuta." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {comunicazioni.map((c) => (
              <ComunicazioneItem
                key={c.id}
                id={c.id}
                titolo={c.titolo}
                testo={c.testo}
                createdAt={c.createdAt}
                letta={c.letture.length > 0}
              />
            ))}
          </ul>
        )}
      </Card>

    </div>
  );
}
