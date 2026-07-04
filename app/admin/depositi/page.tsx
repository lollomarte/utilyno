import { PiggyBank, ShieldCheck } from "lucide-react";
import { getAdminDashboardStats, getPoolDepositiPerAgenzia } from "@/lib/data/admin";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDepositiPage() {
  const [stats, poolDepositiPerAgenzia] = await Promise.all([getAdminDashboardStats(), getPoolDepositiPerAgenzia()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Depositi</h1>
        <p className="mt-1 text-sm text-slate-500">Depositi cauzionali attualmente in pancia alla piattaforma</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Pool depositi totale"
          value={formatCurrency(stats.poolDepositiTotale)}
          hint="Floating gestito in attesa di restituzione"
          icon={PiggyBank}
        />
        <StatCard label="Depositi versati" value={String(stats.numeroDepositiVersati)} icon={ShieldCheck} />
      </div>

      <Card className="p-0">
        <div className="p-6 pb-0">
          <CardHeader
            title="Depositi per agenzia"
            description="Depositi cauzionali attualmente versati (VERSATO), per agenzia: la liquidità che in produzione transiterebbe su Partner 1"
          />
        </div>
        {poolDepositiPerAgenzia.length === 0 ? (
          <EmptyState message="Nessun deposito versato al momento." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Agenzia</TableHeaderCell>
                <TableHeaderCell>Depositi versati</TableHeaderCell>
                <TableHeaderCell>Totale</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {poolDepositiPerAgenzia.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-ink">{a.ragioneSociale}</TableCell>
                  <TableCell>{a.numeroDepositi}</TableCell>
                  <TableCell>{formatCurrency(a.totale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
