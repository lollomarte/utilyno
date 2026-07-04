import { notFound } from "next/navigation";
import { requireAgenzia } from "@/lib/auth-helpers";
import { getContrattoDetail } from "@/lib/data/agenzia";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge, StatoPagamentoBadge, StatoDepositoBadge } from "@/components/ui/badge";
import { RegistraAdEButton, RinnovaRegistrazioneButton } from "@/components/agenzia/registra-ade-button";
import { GeneraInvitoButton } from "@/components/agenzia/genera-invito-button";
import { ChecklistForm } from "@/components/agenzia/checklist-form";
import { GestisciRestituzioneDepositoButton } from "@/components/depositi/gestisci-restituzione-deposito-button";
import { calcolaInteressiLegali } from "@/lib/depositi/calcolaInteressiLegali";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  STATO_CONTRATTO_LABELS,
  STATO_PAGAMENTO_LABELS,
  STATO_DEPOSITO_LABELS,
  TIPO_CONTRATTO_LABELS,
  REGIME_FISCALE_LABELS,
  TIPO_CHECKLIST_LABELS,
} from "@/lib/labels";

export default async function ContrattoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { agenzia } = await requireAgenzia();
  const contratto = await getContrattoDetail(id, agenzia.id);

  if (!contratto) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {contratto.immobile.indirizzo}, {contratto.immobile.comune}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Inquilino: {contratto.inquilino.user.nome} {contratto.inquilino.user.cognome}
          </p>
        </div>
        <StatoContrattoBadge stato={contratto.stato} label={STATO_CONTRATTO_LABELS[contratto.stato]} />
      </div>

      <Card>
        <CardHeader title="Dati contratto" />
        <DescriptionList
          items={[
            { label: "Tipo contratto", value: TIPO_CONTRATTO_LABELS[contratto.tipoContratto] },
            { label: "Regime fiscale", value: REGIME_FISCALE_LABELS[contratto.regimeFiscale] },
            { label: "Canone mensile", value: formatCurrency(contratto.canoneMensile) },
            { label: "Data inizio", value: formatDate(contratto.dataInizio) },
            { label: "Data fine", value: formatDate(contratto.dataFine) },
            { label: "Proprietario", value: `${contratto.immobile.proprietario.user.nome} ${contratto.immobile.proprietario.user.cognome}` },
            {
              label: "Registrazione Agenzia delle Entrate",
              value: contratto.dataRegistrazioneAdE
                ? `Registrato il ${formatDate(contratto.dataRegistrazioneAdE)}`
                : "Non ancora registrato",
            },
            {
              label: "Ultimo rinnovo registrazione",
              value: contratto.dataUltimoRinnovoRegistrazione
                ? formatDate(contratto.dataUltimoRinnovoRegistrazione)
                : "Nessun rinnovo registrato",
            },
          ]}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          {!contratto.dataRegistrazioneAdE && <RegistraAdEButton contrattoId={contratto.id} />}
          {contratto.dataRegistrazioneAdE && <RinnovaRegistrazioneButton contrattoId={contratto.id} />}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Onboarding inquilino"
          description="Genera un link di invito per far completare all'inquilino l'attivazione del proprio account"
        />
        <GeneraInvitoButton contrattoId={contratto.id} />
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
            ...(contratto.depositoStato === "IN_CONTESTAZIONE" && contratto.depositoNote
              ? [{ label: "Motivo contestazione", value: contratto.depositoNote }]
              : []),
          ]}
        />
        {contratto.stato !== "ATTIVO" && (contratto.depositoStato === "VERSATO" || contratto.depositoStato === "IN_CONTESTAZIONE") && (
          <div className="mt-4">
            <GestisciRestituzioneDepositoButton
              contrattoId={contratto.id}
              depositoImporto={contratto.depositoImporto}
              interessiStimati={calcolaInteressiLegali(contratto.depositoImporto, contratto.dataInizio, contratto.dataFine)}
            />
          </div>
        )}
      </Card>

      <Card>
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
                <TableHeaderCell>Metodo</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contratto.pagamenti.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.dataScadenza)}</TableCell>
                  <TableCell>{formatCurrency(p.importo)}</TableCell>
                  <TableCell>{p.dataPagamento ? formatDate(p.dataPagamento) : "-"}</TableCell>
                  <TableCell>{p.metodoPagamento ?? "-"}</TableCell>
                  <TableCell>
                    <StatoPagamentoBadge stato={p.stato} label={STATO_PAGAMENTO_LABELS[p.stato]} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Compila checklist" description="Ingresso o uscita, con foto e conferma firma proprietario" />
        <ChecklistForm contrattoId={contratto.id} />
      </Card>

      <Card>
        <CardHeader title="Checklist immobile" />
        {contratto.checklist.length === 0 ? (
          <EmptyState message="Nessuna checklist compilata." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {contratto.checklist.map((c) => (
              <li key={c.id} className="py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">
                    {TIPO_CHECKLIST_LABELS[c.tipo]} &middot; {c.fotoUrls.length} foto
                  </span>
                  <span className="text-slate-400">{formatDate(c.dataCompilazione)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Firma inquilino: {c.firmaInquilinoAt ? `confermata il ${formatDate(c.firmaInquilinoAt)}` : "da confermare"}
                  {" · "}
                  Firma proprietario: {c.firmaProprietarioAt ? `confermata il ${formatDate(c.firmaProprietarioAt)}` : "da confermare"}
                </p>
                {c.note && <p className="mt-1 text-sm text-slate-600">{c.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Documenti allegati" />
        {contratto.documenti.length === 0 ? (
          <EmptyState message="Nessun documento allegato." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {contratto.documenti.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-700">{doc.nome}</span>
                <span className="text-slate-400">{formatDate(doc.uploadedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
