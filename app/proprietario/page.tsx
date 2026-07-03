import Link from "next/link";
import { addYears, differenceInCalendarDays } from "date-fns";
import { requireProprietario } from "@/lib/auth-helpers";
import {
  getImmobiliForProprietario,
  getProprietarioDashboardStats,
  getSegnalazioniPerProprietario,
  getComunicazioniPerProprietario,
  getDocumentiPerProprietario,
} from "@/lib/data/proprietario";
import { ComunicazioneItem } from "@/components/comunicazioni/comunicazione-item";
import { AssicurazioneCta } from "@/components/proprietario/assicurazione-cta";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { Badge, StatoSegnalazioneBadge, StatoDepositoBadge, StatoAssicurazioneBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { TIPO_IMMOBILE_LABELS, STATO_SEGNALAZIONE_LABELS, STATO_DEPOSITO_LABELS, STATO_ASSICURAZIONE_LABELS } from "@/lib/labels";

type Scadenza = {
  tipo: string;
  immobile: string;
  data: Date;
};

function countdown(data: Date) {
  const giorni = differenceInCalendarDays(data, new Date());
  if (giorni < 0) return { label: `Scaduta da ${Math.abs(giorni)} giorni`, tone: "danger" as const };
  if (giorni === 0) return { label: "Scade oggi", tone: "danger" as const };
  if (giorni <= 30) return { label: `Tra ${giorni} giorni`, tone: "warning" as const };
  return { label: `Tra ${giorni} giorni`, tone: "neutral" as const };
}

export default async function ProprietarioDashboardPage() {
  const { session, proprietario } = await requireProprietario();
  const [immobili, stats, segnalazioni, comunicazioni, documenti] = await Promise.all([
    getImmobiliForProprietario(proprietario.id),
    getProprietarioDashboardStats(proprietario.id),
    getSegnalazioniPerProprietario(proprietario.id),
    getComunicazioniPerProprietario(proprietario.id, session.user.id),
    getDocumentiPerProprietario(proprietario.id),
  ]);

  const rendimenti = immobili.map((immobile) => {
    const contrattoAttivo = immobile.contratti[0];
    const yieldLordo =
      contrattoAttivo && immobile.valoreStimato > 0 ? (contrattoAttivo.canoneMensile * 12) / immobile.valoreStimato : null;
    return { immobile, yieldLordo };
  });
  const yieldMedi = rendimenti.filter((r) => r.yieldLordo !== null).map((r) => r.yieldLordo!);
  const yieldMedioPortafoglio = yieldMedi.length > 0 ? yieldMedi.reduce((sum, y) => sum + y, 0) / yieldMedi.length : null;

  const contrattiAttivi = immobili.flatMap((immobile) => immobile.contratti.map((c) => ({ ...c, immobile })));

  const scadenze: Scadenza[] = [];
  for (const contratto of contrattiAttivi) {
    scadenze.push({
      tipo: "Rinnovo contratto",
      immobile: `${contratto.immobile.indirizzo}, ${contratto.immobile.comune}`,
      data: contratto.dataFine,
    });
    const baseRegistrazione = contratto.dataUltimoRinnovoRegistrazione ?? contratto.dataRegistrazioneAdE;
    if (baseRegistrazione) {
      scadenze.push({
        tipo: "Rinnovo registrazione AdE",
        immobile: `${contratto.immobile.indirizzo}, ${contratto.immobile.comune}`,
        data: addYears(baseRegistrazione, 1),
      });
    }
  }
  for (const immobile of immobili) {
    for (const assicurazione of immobile.assicurazioni) {
      scadenze.push({
        tipo: "Scadenza assicurazione",
        immobile: `${immobile.indirizzo}, ${immobile.comune}`,
        data: assicurazione.dataScadenza,
      });
    }
  }
  scadenze.sort((a, b) => a.data.getTime() - b.data.getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Panoramica del tuo portfolio immobiliare</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Immobili" value={String(stats.numeroImmobili)} />
        <StatCard label="Canone medio" value={formatCurrency(stats.canoneMedio)} />
        <StatCard
          label="Occupazione"
          value={`${stats.immobiliOccupati}/${stats.numeroImmobili}`}
          hint="Immobili con contratto attivo"
        />
        <StatCard
          label="Yield lordo medio"
          value={yieldMedioPortafoglio !== null ? `${(yieldMedioPortafoglio * 100).toFixed(2)}%` : "-"}
          hint="Canone annuo / valore stimato"
        />
      </div>

      <Card>
        <CardHeader title="I tuoi immobili" description="Rendimento lordo calcolato su canone annuo e valore stimato" />
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
              {rendimenti.map(({ immobile, yieldLordo }) => (
                <TableRow key={immobile.id}>
                  <TableCell>
                    <Link href={`/proprietario/immobili/${immobile.id}`} className="font-medium text-slate-900 hover:underline">
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

      <Card>
        <CardHeader title="Depositi cauzionali" description="Stato del deposito per ogni contratto attivo" />
        {contrattiAttivi.length === 0 ? (
          <EmptyState message="Nessun contratto attivo." />
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
              {contrattiAttivi.map((contratto) => (
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

      <Card>
        <CardHeader title="Scadenze imminenti" description="Rinnovi contratto, registrazione AdE e assicurazioni" />
        {scadenze.length === 0 ? (
          <EmptyState message="Nessuna scadenza registrata." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {scadenze.map((s, index) => {
              const { label, tone } = countdown(s.data);
              return (
                <li key={index} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.tipo}</p>
                    <p className="text-sm text-slate-500">{s.immobile}</p>
                    <p className="text-xs text-slate-400">{formatDate(s.data)}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-medium",
                      tone === "danger" && "text-red-600",
                      tone === "warning" && "text-amber-600",
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
              return (
                <li key={immobile.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
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
                  {assicurazione ? (
                    <StatoAssicurazioneBadge stato={assicurazione.stato} label={STATO_ASSICURAZIONE_LABELS[assicurazione.stato]} />
                  ) : (
                    <AssicurazioneCta immobileId={immobile.id} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Prossimi incassi" />
        {stats.prossimiIncassi.length === 0 ? (
          <EmptyState message="Nessun incasso previsto nei prossimi 30 giorni." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
                <TableHeaderCell>Importo</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.prossimiIncassi.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.contratto.immobile.indirizzo}, {p.contratto.immobile.comune}
                  </TableCell>
                  <TableCell>{formatDate(p.dataScadenza)}</TableCell>
                  <TableCell>{formatCurrency(p.importo)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Comunicazioni" description="Comunicazioni inviate dagli amministratori dei tuoi condomini" />
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

      <Card>
        <CardHeader title="Segnalazioni ricevute" description="Segnalazioni condominiali relative ai tuoi immobili" />
        {segnalazioni.length === 0 ? (
          <EmptyState message="Nessuna segnalazione ricevuta." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {segnalazioni.map((s) => (
              <li key={s.id} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-900">
                    {s.titolo} &middot; {s.immobile?.indirizzo}
                  </span>
                  <StatoSegnalazioneBadge stato={s.stato} label={STATO_SEGNALAZIONE_LABELS[s.stato]} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{s.descrizione}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(s.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Documenti" description="Documenti collegati ai tuoi immobili e contratti" />
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
              {documenti.map((doc) => {
                const immobile = doc.immobile ?? doc.contratto?.immobile;
                return (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.nome}</TableCell>
                    <TableCell>{immobile ? `${immobile.indirizzo}, ${immobile.comune}` : "-"}</TableCell>
                    <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                    <TableCell>
                      <a href={doc.url} download className="font-medium text-slate-900 hover:underline">
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
