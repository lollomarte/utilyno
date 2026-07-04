import Link from "next/link";
import { FileText, Euro, CalendarClock, AlertTriangle } from "lucide-react";
import { requireAgenzia } from "@/lib/auth-helpers";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import {
  getAgenziaDashboardStats,
  getContrattiInScadenza,
  getAndamentoIncassiAgenzia,
  getDistribuzionePagamentiAgenzia,
  getPagamentiInRitardoPerAgenzia,
} from "@/lib/data/agenzia";
import { getSegnalazioniNonLette } from "@/lib/data/segnalazioni";
import { StatCard, type StatTrend } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { IncassiChart } from "@/components/charts/incassi-chart";
import { PagamentiDonut } from "@/components/charts/pagamenti-donut";
import { PagamentiInRitardoList } from "@/components/pagamenti/pagamenti-in-ritardo-list";
import { SegnalazioniNonLetteBadge } from "@/components/segnalazioni/non-lette-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AgenziaDashboardPage() {
  const { session, agenzia } = await requireAgenzia();
  await aggiornaPagamentiScaduti();
  const [stats, contrattiInScadenza, leadReListing, andamentoIncassi, distribuzionePagamenti, nonLette, pagamentiInRitardo] =
    await Promise.all([
      getAgenziaDashboardStats(agenzia.id),
      getContrattiInScadenza(agenzia.id, 60),
      getContrattiInScadenza(agenzia.id, 90),
      getAndamentoIncassiAgenzia(agenzia.id),
      getDistribuzionePagamentiAgenzia(agenzia.id),
      getSegnalazioniNonLette(session.user.id),
      getPagamentiInRitardoPerAgenzia(agenzia.id),
    ]);

  const meseCorrente = andamentoIncassi[andamentoIncassi.length - 1]?.importo ?? 0;
  const mesePrecedente = andamentoIncassi[andamentoIncassi.length - 2]?.importo ?? 0;
  const trendIncassi: StatTrend | undefined =
    mesePrecedente > 0
      ? {
          value: `${Math.abs(Math.round(((meseCorrente - mesePrecedente) / mesePrecedente) * 100))}% vs mese scorso`,
          direction: meseCorrente >= mesePrecedente ? "up" : "down",
        }
      : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">{agenzia.ragioneSociale}</p>
        </div>
        <SegnalazioniNonLetteBadge count={nonLette} href="/agenzia/segnalazioni" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Contratti attivi" value={String(stats.contrattiAttivi)} icon={FileText} />
        <StatCard
          label="Canoni incassati questo mese"
          value={formatCurrency(stats.canoniIncassatiMese)}
          icon={Euro}
          trend={trendIncassi}
        />
        <StatCard
          label="In scadenza nei prossimi 60gg"
          value={String(stats.contrattiInScadenza)}
          tone={stats.contrattiInScadenza > 0 ? "warning" : "default"}
          icon={CalendarClock}
        />
        <StatCard
          label="Pagamenti in ritardo"
          value={String(stats.pagamentiInRitardo)}
          tone={stats.pagamentiInRitardo > 0 ? "danger" : "default"}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Andamento incassi" description="Ultimi 6 mesi" />
          <IncassiChart data={andamentoIncassi} />
        </Card>
        <Card>
          <CardHeader title="Distribuzione stato pagamenti" description="Tutti i contratti dell'agenzia" />
          <PagamentiDonut data={distribuzionePagamenti} />
        </Card>
      </div>

      <PagamentiInRitardoList
        description="Canoni scaduti non ancora saldati su tutto il portfolio gestito"
        righe={pagamentiInRitardo.map((p) => ({
          id: p.id,
          importo: p.importo,
          dataScadenza: p.dataScadenza,
          stato: p.stato as "IN_RITARDO" | "INSOLUTO",
          immobile: `${p.contratto.immobile.indirizzo}, ${p.contratto.immobile.comune}`,
          inquilino: `${p.contratto.inquilino.user.nome} ${p.contratto.inquilino.user.cognome}`,
        }))}
      />

      <Card>
        <CardHeader title="Contratti in scadenza nei prossimi 60 giorni" description="Promemoria operativo per rinnovi e adempimenti" />
        {contrattiInScadenza.length === 0 ? (
          <EmptyState message="Nessun contratto in scadenza a breve." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Inquilino</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contrattiInScadenza.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/agenzia/contratti/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.immobile.indirizzo}, {c.immobile.comune}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {c.inquilino.user.nome} {c.inquilino.user.cognome}
                  </TableCell>
                  <TableCell>{formatDate(c.dataFine)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Opportunità di re-listing"
          description="Contratti in scadenza nei prossimi 90 giorni: potenziali immobili da rimettere sul mercato"
        />
        {leadReListing.length === 0 ? (
          <EmptyState message="Nessuna opportunità di re-listing nei prossimi 90 giorni." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Proprietario</TableHeaderCell>
                <TableHeaderCell>Canone attuale</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leadReListing.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/agenzia/contratti/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.immobile.indirizzo}, {c.immobile.comune}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {c.immobile.proprietario.user.nome} {c.immobile.proprietario.user.cognome}
                  </TableCell>
                  <TableCell>{formatCurrency(c.canoneMensile)}</TableCell>
                  <TableCell>{formatDate(c.dataFine)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
