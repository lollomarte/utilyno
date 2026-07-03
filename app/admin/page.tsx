import Link from "next/link";
import { getAdminDashboardStats, getAgenzieConPortfolio } from "@/lib/data/admin";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [stats, agenzie] = await Promise.all([getAdminDashboardStats(), getAgenzieConPortfolio()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Vista aggregata sulla piattaforma WERENT</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Agenzie" value={String(stats.numeroAgenzie)} />
        <StatCard label="Contratti totali" value={String(stats.numeroContratti)} hint={`${stats.contrattiAttivi} attivi`} />
        <StatCard label="Volume incassato" value={formatCurrency(stats.volumeIncassato)} hint="Totale storico" />
        <StatCard
          label="Pagamenti in ritardo"
          value={String(stats.pagamentiInRitardo)}
          tone={stats.pagamentiInRitardo > 0 ? "danger" : "default"}
        />
      </div>

      <Card>
        <CardHeader title="Agenzie e relativo portfolio" />
        {agenzie.length === 0 ? (
          <EmptyState message="Nessuna agenzia registrata." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Agenzia</TableHeaderCell>
                <TableHeaderCell>Immobili</TableHeaderCell>
                <TableHeaderCell>Contratti</TableHeaderCell>
                <TableHeaderCell>Canoni mensili attivi</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agenzie.map((agenzia) => (
                <TableRow key={agenzia.id}>
                  <TableCell>
                    <Link href={`/admin/agenzie/${agenzia.id}`} className="font-medium text-slate-900 hover:underline">
                      {agenzia.ragioneSociale}
                    </Link>
                  </TableCell>
                  <TableCell>{agenzia.numeroImmobili}</TableCell>
                  <TableCell>{agenzia.numeroContratti}</TableCell>
                  <TableCell>{formatCurrency(agenzia.canoniMensiliAttivi)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
