import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { Building2, Euro, Users, TrendingUp } from "lucide-react";
import { requireProprietario } from "@/lib/auth-helpers";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import {
  getImmobiliForProprietario,
  getProprietarioDashboardStats,
  getComunicazioniPerProprietario,
  getAndamentoIncassiProprietario,
  getPagamentiInRitardoPerProprietario,
  getDepositiDaRestituire,
  calcolaScadenzeProprietario,
} from "@/lib/data/proprietario";
import { getDocumentiPerUtente } from "@/lib/data/documenti";
import { getSegnalazioniNonLette } from "@/lib/data/segnalazioni";
import { getFornitoriAssicurazione } from "@/lib/data/assicurazioni";
import { ComunicazioneItem } from "@/components/comunicazioni/comunicazione-item";
import { AttivaAssicurazioneButton } from "@/components/assicurazioni/attiva-assicurazione-button";
import { RinnovaAssicurazioneButton } from "@/components/assicurazioni/rinnova-assicurazione-button";
import { PagamentiInRitardoList } from "@/components/pagamenti/pagamenti-in-ritardo-list";
import { SegnalazioniNonLetteBadge } from "@/components/segnalazioni/non-lette-badge";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { Badge, StatoDepositoBadge, StatoAssicurazioneBadge } from "@/components/ui/badge";
import { IncassiChart } from "@/components/charts/incassi-chart-dynamic";
import { formatCurrency, formatDate, cn, countdownScadenza } from "@/lib/utils";
import { TIPO_IMMOBILE_LABELS, STATO_DEPOSITO_LABELS, STATO_ASSICURAZIONE_LABELS } from "@/lib/labels";

export default async function ProprietarioDashboardPage() {
  const { session, proprietario } = await requireProprietario();
  await aggiornaPagamentiScaduti();
  const [
    immobili,
    stats,
    comunicazioni,
    documenti,
    andamentoIncassi,
    nonLette,
    pagamentiInRitardo,
    depositiDaRestituire,
    fornitoriAssicurazione,
  ] = await Promise.all([
    getImmobiliForProprietario(proprietario.id),
    getProprietarioDashboardStats(proprietario.id),
    getComunicazioniPerProprietario(proprietario.id, session.user.id),
    getDocumentiPerUtente(session.user.id),
    getAndamentoIncassiProprietario(proprietario.id),
    getSegnalazioniNonLette(session.user.id),
    getPagamentiInRitardoPerProprietario(proprietario.id),
    getDepositiDaRestituire(proprietario.id),
    getFornitoriAssicurazione(),
  ]);

  const rendimenti = immobili.map((immobile) => {
    const contrattoAttivo = immobile.contratti[0];
    const yieldLordo =
      contrattoAttivo && immobile.valoreStimato > 0 ? (contrattoAttivo.canoneMensile * 12) / immobile.valoreStimato : null;
    return { immobile, yieldLordo };
  });
  const yieldMedi = rendimenti.filter((r) => r.yieldLordo !== null).map((r) => r.yieldLordo!);
  const yieldMedioPortafoglio = yieldMedi.length > 0 ? yieldMedi.reduce((sum, y) => sum + y, 0) / yieldMedi.length : null;

  const scadenze = calcolaScadenzeProprietario(immobili);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Panoramica del tuo portfolio immobiliare</p>
        </div>
        <SegnalazioniNonLetteBadge count={nonLette} href="/proprietario/segnalazioni" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Immobili" value={String(stats.numeroImmobili)} icon={Building2} />
        <StatCard label="Canone medio" value={formatCurrency(stats.canoneMedio)} icon={Euro} />
        <StatCard
          label="Occupazione"
          value={`${stats.immobiliOccupati}/${stats.numeroImmobili}`}
          hint="Immobili con contratto attivo"
          icon={Users}
        />
        <StatCard
          label="Yield lordo medio"
          value={yieldMedioPortafoglio !== null ? `${(yieldMedioPortafoglio * 100).toFixed(2)}%` : "-"}
          hint="Canone annuo / valore stimato"
          icon={TrendingUp}
        />
      </div>

      <PagamentiInRitardoList
        description="Canoni scaduti non ancora saldati sui tuoi immobili"
        righe={pagamentiInRitardo.slice(0, 5).map((p) => ({
          id: p.id,
          importo: p.importo,
          dataScadenza: p.dataScadenza,
          stato: p.stato as "IN_RITARDO" | "INSOLUTO",
          immobile: `${p.contratto.immobile.indirizzo}, ${p.contratto.immobile.comune}`,
          inquilino: `${p.contratto.inquilino.user.nome} ${p.contratto.inquilino.user.cognome}`,
        }))}
      />

      <Card>
        <CardHeader title="Andamento incassi" description="Ultimi 6 mesi, tutti gli immobili" />
        <IncassiChart data={andamentoIncassi} />
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader title="I tuoi immobili" description="Anteprima — i primi 3, per rendimento lordo" />
          <Link href="/proprietario/immobili" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
        {immobili.length === 0 ? (
          <EmptyState message="Nessun immobile associato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Indirizzo</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Valore stimato</TableHeaderCell>
                <TableHeaderCell>Yield lordo</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rendimenti.slice(0, 3).map(({ immobile, yieldLordo }) => (
                <TableRow key={immobile.id}>
                  <TableCell>
                    <Link href={`/proprietario/immobili/${immobile.id}`} className="font-medium text-ink hover:underline">
                      {immobile.indirizzo}, {immobile.comune}
                    </Link>
                  </TableCell>
                  <TableCell>{TIPO_IMMOBILE_LABELS[immobile.tipoImmobile]}</TableCell>
                  <TableCell>{formatCurrency(immobile.valoreStimato)}</TableCell>
                  <TableCell>{yieldLordo !== null ? `${(yieldLordo * 100).toFixed(2)}%` : "-"}</TableCell>
                  <TableCell>
                    {immobile.contratti.length > 0 ? (
                      <Badge tone="success">Occupato</Badge>
                    ) : (
                      <Badge tone="neutral">Libero</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader title="Depositi da restituire" description="Anteprima — contratti conclusi con deposito ancora da restituire" />
          <Link href="/proprietario/pagamenti" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
        {depositiDaRestituire.length === 0 ? (
          <EmptyState message="Nessun deposito in attesa di restituzione." />
        ) : (
          <ul className="divide-y divide-slate-100 px-6 pb-2">
            {depositiDaRestituire.slice(0, 3).map((contratto) => (
              <li key={contratto.id} className="py-3">
                <p className="text-sm font-medium text-ink">
                  {contratto.immobile.indirizzo}, {contratto.immobile.comune}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Deposito {formatCurrency(contratto.depositoImporto)} &middot;{" "}
                  <StatoDepositoBadge stato={contratto.depositoStato} label={STATO_DEPOSITO_LABELS[contratto.depositoStato]} />
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Scadenze imminenti" description="Rinnovi contratto, registrazione AdE e assicurazioni" />
        {scadenze.length === 0 ? (
          <EmptyState message="Nessuna scadenza registrata." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {scadenze.slice(0, 5).map((s, index) => {
              const { label, tone } = countdownScadenza(s.data);
              return (
                <li key={index} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{s.tipo}</p>
                    <p className="text-sm text-slate-500">{s.immobile}</p>
                    <p className="text-xs text-slate-400">{formatDate(s.data)}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-medium",
                      tone === "danger" && "text-danger",
                      tone === "warning" && "text-warning",
                      tone === "neutral" && "text-slate-500"
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Assicurazioni" description="Copertura assicurativa per ogni immobile" />
        {immobili.length === 0 ? (
          <EmptyState message="Nessun immobile associato." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {immobili.map((immobile) => {
              const assicurazione = immobile.assicurazioni[0];
              const giorniAllaScadenza = assicurazione
                ? differenceInCalendarDays(assicurazione.dataScadenza, new Date())
                : null;
              return (
                <li key={immobile.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {immobile.indirizzo}, {immobile.comune}
                    </p>
                    {assicurazione ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {assicurazione.tipo} &middot; {assicurazione.fornitore} &middot; scadenza {formatDate(assicurazione.dataScadenza)}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">Nessuna copertura attiva</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {assicurazione ? (
                      <>
                        <StatoAssicurazioneBadge stato={assicurazione.stato} label={STATO_ASSICURAZIONE_LABELS[assicurazione.stato]} />
                        {giorniAllaScadenza !== null && giorniAllaScadenza <= 60 && (
                          <RinnovaAssicurazioneButton
                            assicurazioneId={assicurazione.id}
                            premioAnnualeAttuale={assicurazione.premioAnnuale}
                            dataScadenzaAttuale={assicurazione.dataScadenza}
                          />
                        )}
                      </>
                    ) : (
                      <AttivaAssicurazioneButton immobileId={immobile.id} fornitoriDisponibili={fornitoriAssicurazione} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Comunicazioni" description="Comunicazioni inviate dagli amministratori dei tuoi condomini" />
        {comunicazioni.length === 0 ? (
          <EmptyState message="Nessuna comunicazione ricevuta." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {comunicazioni.slice(0, 3).map((c) => (
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

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader title="Documenti" description="Anteprima — gli ultimi 3 caricati" />
          <Link href="/proprietario/documenti" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
        {documenti.length === 0 ? (
          <EmptyState message="Nessun documento disponibile." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Caricato il</TableHeaderCell>
                <TableHeaderCell>{""}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documenti.slice(0, 3).map((doc) => {
                const immobile = doc.immobile ?? doc.contratto?.immobile;
                return (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.nome}</TableCell>
                    <TableCell>{immobile ? `${immobile.indirizzo}, ${immobile.comune}` : "-"}</TableCell>
                    <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                    <TableCell>
                      <a href={`/api/documenti/${doc.id}/download`} className="font-medium text-ink hover:underline">
                        Scarica
                      </a>
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
