import { requireAdmin } from "@/lib/auth-helpers";
import {
  getPartnerList,
  getRichiestePreventivo,
  getLeadAggregatoPerCategoria,
  getLeadAggregatoPerPartner,
} from "@/lib/data/lead";
import { RichiesteFiltri } from "@/components/admin/richieste-filtri";
import { RichiestaStatoSelect } from "@/components/admin/richiesta-stato-select";
import { PartnerManager } from "@/components/admin/partner-manager";
import { LeadBarList } from "@/components/admin/lead-bar-list";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { ROLE_LABELS, CATEGORIA_INTERVENTO_LABELS } from "@/lib/labels";
import { CATEGORIA_INTERVENTO_OPTIONS } from "@/lib/validations/segnalazione";
import { STATO_RICHIESTA_PREVENTIVO_OPTIONS } from "@/lib/validations/partner";
import type { CategoriaIntervento, StatoRichiestaPreventivo } from "@prisma/client";

export default async function LeadPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; partnerId?: string; stato?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const categoria = CATEGORIA_INTERVENTO_OPTIONS.includes(params.categoria as CategoriaIntervento)
    ? (params.categoria as CategoriaIntervento)
    : undefined;
  const stato = STATO_RICHIESTA_PREVENTIVO_OPTIONS.includes(params.stato as StatoRichiestaPreventivo)
    ? (params.stato as StatoRichiestaPreventivo)
    : undefined;
  const partnerId = params.partnerId || undefined;

  const [partner, richieste, aggregatoPerCategoria, aggregatoPerPartner] = await Promise.all([
    getPartnerList(),
    getRichiestePreventivo({ categoria, partnerId, stato }),
    getLeadAggregatoPerCategoria(),
    getLeadAggregatoPerPartner(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Lead e Partner</h1>
        <p className="mt-1 text-sm text-slate-500">Traffico generato dalle segnalazioni verso i partner convenzionati</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Lead per categoria" description="Quale tipo di intervento genera più richieste" />
          <LeadBarList items={aggregatoPerCategoria.map((c) => ({ label: c.label, count: c.count }))} />
        </Card>
        <Card>
          <CardHeader title="Lead per partner" description="Quale partner riceve più richieste" />
          <LeadBarList items={aggregatoPerPartner.map((p) => ({ label: p.nome, count: p.count }))} />
        </Card>
      </div>

      <Card>
        <CardHeader title="Richieste di preventivo" description="Tutte le richieste generate dalle segnalazioni" />
        <div className="mb-6">
          <RichiesteFiltri partner={partner.map((p) => ({ id: p.id, nome: p.nome }))} />
        </div>
        {richieste.length === 0 ? (
          <EmptyState message="Nessuna richiesta di preventivo trovata con questi filtri." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Segnalazione</TableHeaderCell>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Partner</TableHeaderCell>
                <TableHeaderCell>Categoria</TableHeaderCell>
                <TableHeaderCell>Richiesta da</TableHeaderCell>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {richieste.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.segnalazione.titolo}</TableCell>
                  <TableCell>
                    {r.segnalazione.immobile.indirizzo}, {r.segnalazione.immobile.comune}
                  </TableCell>
                  <TableCell>{r.partner.nome}</TableCell>
                  <TableCell>{CATEGORIA_INTERVENTO_LABELS[r.partner.categoria]}</TableCell>
                  <TableCell>
                    {r.richiedente.nome} {r.richiedente.cognome} ({ROLE_LABELS[r.richiedente.role] ?? r.richiedente.role})
                  </TableCell>
                  <TableCell>{formatDate(r.createdAt)}</TableCell>
                  <TableCell>
                    <RichiestaStatoSelect richiestaId={r.id} statoAttuale={r.stato} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Partner convenzionati" description="Gestisci i partner disponibili per il matching dei lead" />
        <PartnerManager partner={partner} />
      </Card>
    </div>
  );
}
