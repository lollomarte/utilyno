import Link from "next/link";
import { requireAgenzia } from "@/lib/auth-helpers";
import { getContrattiForAgenzia, getImmobiliForAgenzia, getPrivatiDisponibili } from "@/lib/data/agenzia";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATO_CONTRATTO_LABELS, TIPO_CONTRATTO_LABELS } from "@/lib/labels";
import type { StatoContratto } from "@prisma/client";

export default async function ContrattiPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string; immobileId?: string; inquilinoId?: string }>;
}) {
  const { agenzia } = await requireAgenzia();
  const params = await searchParams;

  const [contratti, immobili, inquilini] = await Promise.all([
    getContrattiForAgenzia(agenzia.id, {
      stato: (params.stato as StatoContratto) || undefined,
      immobileId: params.immobileId || undefined,
      inquilinoId: params.inquilinoId || undefined,
    }),
    getImmobiliForAgenzia(agenzia.id),
    getPrivatiDisponibili(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Contratti</h1>
        <Link href="/agenzia/contratti/nuovo">
          <Button>Nuovo contratto</Button>
        </Link>
      </div>

      <Card>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" method="get">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Stato</label>
            <Select name="stato" defaultValue={params.stato ?? ""}>
              <option value="">Tutti</option>
              {Object.entries(STATO_CONTRATTO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Immobile</label>
            <Select name="immobileId" defaultValue={params.immobileId ?? ""}>
              <option value="">Tutti</option>
              {immobili.map((immobile) => (
                <option key={immobile.id} value={immobile.id}>
                  {immobile.indirizzo}, {immobile.comune}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Inquilino</label>
            <Select name="inquilinoId" defaultValue={params.inquilinoId ?? ""}>
              <option value="">Tutti</option>
              {inquilini.map((inquilino) => (
                <option key={inquilino.id} value={inquilino.id}>
                  {inquilino.user.nome} {inquilino.user.cognome}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <Link href="/agenzia/contratti">
              <Button type="button" variant="secondary">
                Reimposta
              </Button>
            </Link>
            <Button type="submit">Filtra</Button>
          </div>
        </form>
      </Card>

      <Card className="p-0">
        {contratti.length === 0 ? (
          <EmptyState message="Nessun contratto trovato con i filtri selezionati." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Inquilino</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Canone</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contratti.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/agenzia/contratti/${c.id}`} className="font-medium text-ink hover:underline">
                      {c.immobile.indirizzo}, {c.immobile.comune}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {c.inquilino.user.nome} {c.inquilino.user.cognome}
                  </TableCell>
                  <TableCell>{TIPO_CONTRATTO_LABELS[c.tipoContratto]}</TableCell>
                  <TableCell>{formatCurrency(c.canoneMensile)}</TableCell>
                  <TableCell>{formatDate(c.dataFine)}</TableCell>
                  <TableCell>
                    <StatoContrattoBadge stato={c.stato} label={STATO_CONTRATTO_LABELS[c.stato]} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
