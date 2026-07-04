import Link from "next/link";
import { Euro, CalendarClock, FileClock } from "lucide-react";
import { requireInquilino } from "@/lib/auth-helpers";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import { getContrattoAttivoForInquilino, getComunicazioniPerInquilino } from "@/lib/data/inquilino";
import { getUtenzeComplete } from "@/lib/data/utenze";
import { getSegnalazioniNonLette } from "@/lib/data/segnalazioni";
import { ComunicazioneItem } from "@/components/comunicazioni/comunicazione-item";
import { PagamentiInRitardoBanner } from "@/components/pagamenti/pagamenti-in-ritardo-banner";
import { SegnalazioniNonLetteBadge } from "@/components/segnalazioni/non-lette-badge";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
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
  const checklistDaFirmare = contratto.checklist.filter((c) => !c.firmaInquilinoAt).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
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
              <p className="text-sm font-medium text-slate-900">{formatCurrency(prossimaScadenza.importo)}</p>
              <p className="text-sm text-slate-500">Scadenza {formatDate(prossimaScadenza.dataScadenza)}</p>
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
          <p className="text-sm text-slate-600">
            <span className="text-2xl font-semibold text-slate-900">{utenzeAttive}</span> / {utenze.length} attive
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
            <p className="text-sm text-slate-500">Nessuna checklist disponibile.</p>
          ) : (
            <p className="text-sm text-slate-600">
              <span className="text-2xl font-semibold text-slate-900">{checklistDaFirmare}</span> da firmare
            </p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Comunicazioni" description="Comunicazioni inviate dall'amministratore a tutto il condominio" />
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
    </div>
  );
}
