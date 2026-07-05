import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getContrattiGlobali } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATO_CONTRATTO_LABELS, TIPO_CONTRATTO_LABELS } from "@/lib/labels";
import type { StatoContratto } from "@prisma/client";

export default async function AdminContrattiPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const contratti = await getContrattiGlobali({ stato: (params.stato as StatoContratto) || undefined });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Contratti</h1>
        <p className="mt-1 text-sm text-slate-500">Registro di tutti i contratti sulla piattaforma, per ogni agenzia</p>
      </div>

      <Card>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-4" method="get">
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
          <div className="sm:col-span-4 flex justify-end gap-2">
            <Link href="/admin/contratti">
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
          <EmptyState message="Nessun contratto trovato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Agenzia</TableHeaderCell>
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
                    <Link href={`/admin/agenzie/${c.agenzia.id}`} className="font-medium text-ink hover:underline">
                      {c.agenzia.ragioneSociale}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {c.immobile.indirizzo}, {c.immobile.comune}
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
