import Link from "next/link";
import { requireAgenzia } from "@/lib/auth-helpers";
import { getAgenziaDashboardStats, getContrattiForAgenzia } from "@/lib/data/agenzia";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATO_CONTRATTO_LABELS } from "@/lib/labels";
import { addDays } from "date-fns";

export default async function AgenziaDashboardPage() {
  const { agenzia } = await requireAgenzia();
  const stats = await getAgenziaDashboardStats(agenzia.id);

  const now = new Date();
  const contrattiInScadenza = (await getContrattiForAgenzia(agenzia.id, { stato: "ATTIVO" })).filter(
    (c) => c.dataFine >= now && c.dataFine <= addDays(now, 60)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">{agenzia.ragioneSociale}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Contratti attivi" value={String(stats.contrattiAttivi)} />
        <StatCard label="Canoni incassati questo mese" value={formatCurrency(stats.canoniIncassatiMese)} />
        <StatCard
          label="In scadenza nei prossimi 60gg"
          value={String(stats.contrattiInScadenza)}
          tone={stats.contrattiInScadenza > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Pagamenti in ritardo"
          value={String(stats.pagamentiInRitardo)}
          tone={stats.pagamentiInRitardo > 0 ? "danger" : "default"}
        />
      </div>

      <Card>
        <CardHeader title="Contratti in scadenza nei prossimi 60 giorni" />
        {contrattiInScadenza.length === 0 ? (
          <EmptyState message="Nessun contratto in scadenza a breve." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Inquilino</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contrattiInScadenza.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/agenzia/contratti/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.immobile.indirizzo}, {c.immobile.comune}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {c.inquilino.user.nome} {c.inquilino.user.cognome}
                  </TableCell>
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
