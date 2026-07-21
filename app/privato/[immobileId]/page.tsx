import Link from "next/link";
import { notFound } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { Euro, CalendarClock, FileClock, AlertTriangle, Zap, ClipboardCheck } from "lucide-react";
import { requirePrivato } from "@/lib/auth-helpers";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import { getContestoImmobile } from "@/lib/immobili/getImmobiliUtente";
import {
  getImmobileDetailForProprietario,
  getContrattoPerImmobileInquilino,
  getComunicazioniPerInquilino,
} from "@/lib/data/privato";
import { getUtenzeComplete, getFornitoriPerTutteLeUtenze } from "@/lib/data/utenze";
import { getFornitoriAssicurazione } from "@/lib/data/assicurazioni";
import { getSegnalazioniNonLette } from "@/lib/data/segnalazioni";
import { getDocumentiPerUtente } from "@/lib/data/documenti";
import { SegnalazioniTable } from "@/components/segnalazioni/segnalazioni-table";
import { UtenzeSection } from "@/components/utenze/utenze-section";
import { AssicurazioneSection } from "@/components/assicurazioni/assicurazione-section";
import { DocumentiTable } from "@/components/documenti/documenti-table";
import { ComunicazioneItem } from "@/components/comunicazioni/comunicazione-item";
import { SegnalazioniNonLetteBadge } from "@/components/segnalazioni/non-lette-badge";
import { AttentionBlock, type AttentionItem } from "@/components/dashboard/attention-block";
import { ModificaImmobileButton } from "@/components/immobili/modifica-immobile-button";
import { RichiedeGestioneModalButton } from "@/components/immobili/richiedi-gestione-modal";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { CurrencyCountUp } from "@/components/ui/currency-count-up";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge, StatoPagamentoBadge, StatoDepositoBadge, StatoImmobileBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TIPO_IMMOBILE_LABELS,
  STATO_CONTRATTO_LABELS,
  STATO_PAGAMENTO_LABELS,
  STATO_DEPOSITO_LABELS,
  STATO_IMMOBILE_LABELS,
  TIPO_CONTRATTO_LABELS,
  REGIME_FISCALE_LABELS,
} from "@/lib/labels";

export default async function ImmobileDashboardPage({ params }: { params: Promise<{ immobileId: string }> }) {
  const { immobileId } = await params;
  const { session } = await requirePrivato();
  const contesto = await getContestoImmobile(session.user.id, immobileId);
  if (!contesto) notFound();

  if (contesto.relazione === "PROPRIETARIO") {
    return <DashboardProprietario immobileId={immobileId} privatoId={contesto.privatoId} userId={session.user.id} />;
  }
  return <DashboardInquilino immobileId={immobileId} privatoId={contesto.privatoId} userId={session.user.id} />;
}

async function DashboardProprietario({
  immobileId,
  privatoId,
  userId,
}: {
  immobileId: string;
  privatoId: string;
  userId: string;
}) {
  const immobile = await getImmobileDetailForProprietario(immobileId, privatoId);
  if (!immobile) notFound();

  const [utenze, fornitoriPerTipo, fornitoriAssicurazione, documentiTutti] = await Promise.all([
    getUtenzeComplete(immobile.id),
    getFornitoriPerTutteLeUtenze(),
    getFornitoriAssicurazione(),
    getDocumentiPerUtente(userId),
  ]);

  const contrattoAttivo = immobile.contratti.find((c) => c.stato === "ATTIVO");
  const documenti = documentiTutti.filter((d) => d.immobileId === immobileId || d.contratto?.immobileId === immobileId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {immobile.indirizzo}, {immobile.comune}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{TIPO_IMMOBILE_LABELS[immobile.tipoImmobile]}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatoImmobileBadge stato={immobile.stato} label={STATO_IMMOBILE_LABELS[immobile.stato]} />
          {immobile.stato === "BOZZA_PROPRIETARIO" && <RichiedeGestioneModalButton immobileId={immobile.id} />}
          <ModificaImmobileButton immobile={immobile} />
        </div>
      </div>

      <Card>
        <CardHeader title="Dati immobile" />
        <DescriptionList
          items={[
            { label: "Indirizzo", value: `${immobile.indirizzo}, ${immobile.comune} (${immobile.provincia})` },
            { label: "Dati catastali", value: immobile.datiCatastali },
            { label: "Superficie", value: `${immobile.superficieMq} m²` },
            { label: "Classe APE", value: immobile.apeClasse ?? "-" },
            { label: "Valore stimato", value: formatCurrency(immobile.valoreStimato) },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Contratto attivo e deposito" />
        {!contrattoAttivo ? (
          <EmptyState message="Nessun contratto attivo su questo immobile." />
        ) : (
          <DescriptionList
            items={[
              { label: "Inquilino", value: `${contrattoAttivo.inquilino.user.nome} ${contrattoAttivo.inquilino.user.cognome}` },
              { label: "Canone mensile", value: formatCurrency(contrattoAttivo.canoneMensile) },
              { label: "Periodo", value: `${formatDate(contrattoAttivo.dataInizio)} - ${formatDate(contrattoAttivo.dataFine)}` },
              {
                label: "Stato contratto",
                value: <StatoContrattoBadge stato={contrattoAttivo.stato} label={STATO_CONTRATTO_LABELS[contrattoAttivo.stato]} />,
              },
              { label: "Importo deposito", value: formatCurrency(contrattoAttivo.depositoImporto) },
              {
                label: "Stato deposito",
                value: (
                  <StatoDepositoBadge stato={contrattoAttivo.depositoStato} label={STATO_DEPOSITO_LABELS[contrattoAttivo.depositoStato]} />
                ),
              },
              { label: "Interessi legali maturati", value: formatCurrency(contrattoAttivo.interessiLegaliMaturati) },
            ]}
          />
        )}
      </Card>

      <Card className="p-0">
        <div className="p-6 pb-0">
          <CardHeader title="Storico pagamenti ricevuti" />
        </div>
        {immobile.contratti.flatMap((c) => c.pagamenti).length === 0 ? (
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
              {immobile.contratti
                .flatMap((c) => c.pagamenti)
                .sort((a, b) => b.dataScadenza.getTime() - a.dataScadenza.getTime())
                .slice(0, 5)
                .map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.dataScadenza)}</TableCell>
                    <TableCell>{formatCurrency(p.importo)}</TableCell>
                    <TableCell>{p.dataPagamento ? formatDate(p.dataPagamento) : "-"}</TableCell>
                    <TableCell>
                      <StatoPagamentoBadge stato={p.stato} label={STATO_PAGAMENTO_LABELS[p.stato]} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
        <div className="p-6 pt-0">
          <Link href={`/privato/${immobileId}/pagamenti`} className="text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
      </Card>

      <UtenzeSection immobileId={immobile.id} utenze={utenze} fornitoriPerTipo={fornitoriPerTipo} />

      <AssicurazioneSection
        immobileId={immobile.id}
        assicurazione={immobile.assicurazioni[0] ?? null}
        fornitoriDisponibili={fornitoriAssicurazione}
      />

      <Card className="p-0">
        <div className="p-6 pb-0">
          <CardHeader title="Segnalazioni su questo immobile" />
        </div>
        {immobile.segnalazioni.length === 0 ? (
          <EmptyState message="Nessuna segnalazione per questo immobile." />
        ) : (
          <SegnalazioniTable segnalazioni={immobile.segnalazioni} basePath="/privato/segnalazioni" showImmobile={false} />
        )}
        <div className="p-6 pt-0">
          <Link href={`/privato/${immobileId}/segnalazioni`} className="text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
      </Card>

      <Card className="p-0">
        <div className="p-6 pb-0">
          <CardHeader title="Documenti" description="Anteprima — gli ultimi 3 caricati" />
        </div>
        {documenti.length === 0 ? (
          <EmptyState message="Nessun documento disponibile." />
        ) : (
          <DocumentiTable documenti={documenti.slice(0, 3)} />
        )}
        <div className="p-6 pt-0">
          <Link href={`/privato/${immobileId}/documenti`} className="text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
      </Card>
    </div>
  );
}

async function DashboardInquilino({
  immobileId,
  privatoId,
  userId,
}: {
  immobileId: string;
  privatoId: string;
  userId: string;
}) {
  await aggiornaPagamentiScaduti();
  const contratto = await getContrattoPerImmobileInquilino(privatoId, immobileId);
  if (!contratto) notFound();

  const base = `/privato/${immobileId}`;
  const [utenze, comunicazioni, nonLette] = await Promise.all([
    getUtenzeComplete(contratto.immobileId),
    getComunicazioniPerInquilino(contratto.immobile.condominioId, userId),
    getSegnalazioniNonLette(userId),
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
      label: pagamentiInRitardoCount === 1 ? "1 pagamento in ritardo" : `${pagamentiInRitardoCount} pagamenti in ritardo`,
      href: `${base}/pagamenti`,
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
        href: `${base}/pagamenti`,
      });
    }
  }
  if (utenzeDaAttivare > 0) {
    attentionItems.push({
      icon: Zap,
      tone: "info",
      label: utenzeDaAttivare === 1 ? "1 utenza ancora da attivare" : `${utenzeDaAttivare} utenze ancora da attivare`,
      href: `${base}/utenze`,
    });
  }
  if (checklistDaFirmare > 0) {
    attentionItems.push({
      icon: ClipboardCheck,
      tone: "info",
      label: checklistDaFirmare === 1 ? "1 checklist da firmare" : `${checklistDaFirmare} checklist da firmare`,
      href: `${base}/checklist`,
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
        <SegnalazioniNonLetteBadge count={nonLette} href={`${base}/segnalazioni`} />
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
        <CardHeader title="Il tuo contratto" />
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
          ]}
        />
        {contratto.depositoStato === "IN_CONTESTAZIONE" && (
          <div className="mt-4 rounded-control bg-warning/10 p-4 text-sm text-warning ring-1 ring-inset ring-warning/30">
            <p className="font-medium">Il deposito è momentaneamente bloccato per una contestazione.</p>
            {contratto.depositoNote && <p className="mt-1">{contratto.depositoNote}</p>}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <CardHeader title="Prossimo pagamento" />
          <Link href={`${base}/pagamenti`} className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
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
            <Link href={`${base}/utenze`} className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
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
            <Link href={`${base}/checklist`} className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
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
