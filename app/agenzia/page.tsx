import Link from "next/link";
import { FileText, Euro, CalendarClock, AlertTriangle, MessageSquareWarning } from "lucide-react";
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
import { CountUp } from "@/components/ui/count-up";
import { CurrencyCountUp } from "@/components/ui/currency-count-up";
import { AttentionBlock, type AttentionItem } from "@/components/dashboard/attention-block";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { IncassiChart } from "@/components/charts/incassi-chart-dynamic";
import { PagamentiDonut } from "@/components/charts/pagamenti-donut-dynamic";
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

  const attentionItems: AttentionItem[] = [];
  if (stats.pagamentiInRitardo > 0) {
    attentionItems.push({
      icon: AlertTriangle,
      tone: "danger",
      label:
        stats.pagamentiInRitardo === 1 ? "1 pagamento in ritardo" : `${stats.pagamentiInRitardo} pagamenti in ritardo`,
      href: "/agenzia/contratti",
    });
  }
  if (nonLette > 0) {
    attentionItems.push({
      icon: MessageSquareWarning,
      tone: "info",
      label: nonLette === 1 ? "1 segnalazione con novità da leggere" : `${nonLette} segnalazioni con novità da leggere`,
      href: "/agenzia/segnalazioni",
    });
  }
  if (stats.contrattiInScadenza > 0) {
    attentionItems.push({
      icon: CalendarClock,
      tone: "warning",
      label:
        stats.contrattiInScadenza === 1
          ? "1 contratto in scadenza nei prossimi 60 giorni"
          : `${stats.contrattiInScadenza} contratti in scadenza nei prossimi 60 giorni`,
      href: "/agenzia/contratti",
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">{agenzia.ragioneSociale}</p>
        </div>
        <SegnalazioniNonLetteBadge count={nonLette} href="/agenzia/segnalazioni" />
      </div>

      <AttentionBlock items={attentionItems} />

      <div className="stagger-cards grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Contratti attivi" value={<CountUp value={stats.contrattiAttivi} />} icon={FileText} />
        <StatCard
          label="Canoni incassati questo mese"
          value={<CurrencyCountUp value={stats.canoniIncassatiMese} />}
          icon={Euro}
          trend={trendIncassi}
        />
        <StatCard
          label="In scadenza nei prossimi 60gg"
          value={<CountUp value={stats.contrattiInScadenza} />}
          tone={stats.contrattiInScadenza > 0 ? "warning" : "default"}
          icon={CalendarClock}
        />
        <StatCard
          label="Pagamenti in ritardo"
          value={<CountUp value={stats.pagamentiInRitardo} />}
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

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader
            title="Contratti in scadenza nei prossimi 60 giorni"
            description="Anteprima — promemoria operativo per rinnovi e adempimenti"
          />
          <Link href="/agenzia/contratti" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
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
              {contrattiInScadenza.slice(0, 3).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/agenzia/contratti/${c.id}`} className="font-medium text-ink hover:underline">
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

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader
            title="Opportunità di re-listing"
            description="Anteprima — contratti in scadenza nei prossimi 90 giorni"
          />
          <Link href="/agenzia/contratti" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
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
              {leadReListing.slice(0, 3).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/agenzia/contratti/${c.id}`} className="font-medium text-ink hover:underline">
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
