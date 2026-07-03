import { notFound } from "next/navigation";
import { requireAgenzia } from "@/lib/auth-helpers";
import { getContrattoDetail } from "@/lib/data/agenzia";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge, StatoPagamentoBadge } from "@/components/ui/badge";
import { RegistraAdEButton } from "@/components/agenzia/registra-ade-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  STATO_CONTRATTO_LABELS,
  STATO_PAGAMENTO_LABELS,
  TIPO_CONTRATTO_LABELS,
  REGIME_FISCALE_LABELS,
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
          ]}
        />
        {!contratto.dataRegistrazioneAdE && (
          <div className="mt-4">
            <RegistraAdEButton contrattoId={contratto.id} />
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
