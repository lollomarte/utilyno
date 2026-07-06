import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { Euro, CalendarClock, FileClock, AlertTriangle, Zap, ClipboardCheck } from "lucide-react";
import { requireInquilino } from "@/lib/auth-helpers";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import { getContrattoAttivoForInquilino, getComunicazioniPerInquilino } from "@/lib/data/inquilino";
import { getUtenzeComplete } from "@/lib/data/utenze";
import { getSegnalazioniNonLette } from "@/lib/data/segnalazioni";
import { ComunicazioneItem } from "@/components/comunicazioni/comunicazione-item";
import { SegnalazioniNonLetteBadge } from "@/components/segnalazioni/non-lette-badge";
import { AttentionBlock, type AttentionItem } from "@/components/dashboard/attention-block";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { CurrencyCountUp } from "@/components/ui/currency-count-up";
import { EmptyState } from "@/components/ui/table";
import { StatoPagamentoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TIPO_CONTRATTO_LABELS, STATO_PAGAMENTO_LABELS } from "@/lib/labels";

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
    getUtenzeComplete(contratto.immobileId),
    getComunicazioniPerInquilino(contratto.immobile.condominioId, session.user.id),
    getSegnalazioniNonLette(session.user.id),
  ]);
  const prossimaScadenza = contratto.pagamenti
    .filter((p) => p.stato === "PROGRAMMATO" || p.stato === "IN_RITARDO")
    .sort((a, b) => a.dataScadenza.getTime() - b.dataScadenza.getTime())[0];
  const pagamentiInRitardoCount = contratto.pagamenti.filter(
    (p) => p.stato === "IN_RITARDO" || p.stato === "INSOLUTO"
  ).length;
  const utenzeAttive = utenze.filter((u) => u.stato === "ATTIVA").length;
  const utenzeDaAttivare = utenze.length - utenzeAttive;
  const checklistDaFirmare = contratto.checklist.filter((c) => !c.firmaInquilinoAt).length;

  const attentionItems: AttentionItem[] = [];
  if (pagamentiInRitardoCount > 0) {
    attentionItems.push({
      icon: AlertTriangle,
      tone: "danger",
      label:
        pagamentiInRitardoCount === 1 ? "1 pagamento in ritardo" : `${pagamentiInRitardoCount} pagamenti in ritardo`,
      href: "/inquilino/pagamenti",
    });
  } else if (prossimaScadenza) {
    const giorni = differenceInCalendarDays(prossimaScadenza.dataScadenza, new Date());
    if (giorni <= 7) {
      attentionItems.push({
        icon: CalendarClock,
        tone: "warning",
        label:
          giorni <= 0
            ? `Canone di ${formatCurrency(prossimaScadenza.importo)} in scadenza oggi`
            : `Canone di ${formatCurrency(prossimaScadenza.importo)} in scadenza tra ${giorni} giorni`,
        href: "/inquilino/pagamenti",
      });
    }
  }
  if (utenzeDaAttivare > 0) {
    attentionItems.push({
      icon: Zap,
      tone: "info",
      label: utenzeDaAttivare === 1 ? "1 utenza ancora da attivare" : `${utenzeDaAttivare} utenze ancora da attivare`,
      href: "/inquilino/utenze",
    });
  }
  if (checklistDaFirmare > 0) {
    attentionItems.push({
      icon: ClipboardCheck,
      tone: "info",
      label: checklistDaFirmare === 1 ? "1 checklist da firmare" : `${checklistDaFirmare} checklist da firmare`,
      href: "/inquilino/checklist",
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {contratto.immobile.indirizzo}, {contratto.immobile.comune}
          </p>
        </div>
        <SegnalazioniNonLetteBadge count={nonLette} href="/inquilino/segnalazioni" />
      </div>

      <AttentionBlock items={attentionItems} />

      <div className="stagger-cards grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Canone mensile" value={<CurrencyCountUp value={contratto.canoneMensile} />} icon={Euro} />
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
        <div className="flex items-center justify-between">
          <CardHeader title="Il tuo contratto" />
          <Link href="/inquilino/contratto" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
        <DescriptionList
          items={[
            { label: "Tipo contratto", value: TIPO_CONTRATTO_LABELS[contratto.tipoContratto] },
            { label: "Agenzia", value: contratto.agenzia.ragioneSociale },
            { label: "Periodo", value: `${formatDate(contratto.dataInizio)} - ${formatDate(contratto.dataFine)}` },
            { label: "Deposito versato", value: formatCurrency(contratto.depositoImporto) },
          ]}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <CardHeader title="Prossimo pagamento" />
          <Link href="/inquilino/pagamenti" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
        {!prossimaScadenza ? (
          <EmptyState message="Nessun pagamento in programma." />
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">{formatCurrency(prossimaScadenza.importo)}</p>
              <p className="text-sm text-ink-muted">Scadenza {formatDate(prossimaScadenza.dataScadenza)}</p>
            </div>
            <StatoPagamentoBadge stato={prossimaScadenza.stato} label={STATO_PAGAMENTO_LABELS[prossimaScadenza.stato]} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <CardHeader title="Utenze" />
            <Link href="/inquilino/utenze" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
              Vedi tutto
            </Link>
          </div>
          <p className="text-sm text-ink-muted">
            <span className="font-mono text-2xl font-medium text-ink">{utenzeAttive}</span> / {utenze.length} attive
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardHeader title="Checklist" />
            <Link href="/inquilino/checklist" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
              Vedi tutto
            </Link>
          </div>
          {contratto.checklist.length === 0 ? (
            <p className="text-sm text-ink-muted">Nessuna checklist disponibile.</p>
          ) : (
            <p className="text-sm text-ink-muted">
              <span className="font-mono text-2xl font-medium text-ink">{checklistDaFirmare}</span> da firmare
            </p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Comunicazioni" description="Comunicazioni inviate dall'amministratore a tutto il condominio" />
        {comunicazioni.length === 0 ? (
          <EmptyState message="Nessuna comunicazione ricevuta." />
        ) : (
          <ul className="divide-y divide-border/60">
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
    </div>
  );
}
