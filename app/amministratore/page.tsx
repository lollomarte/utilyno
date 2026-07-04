import Link from "next/link";
import { Building2, Home, MessageSquareWarning } from "lucide-react";
import { requireAmministratore } from "@/lib/auth-helpers";
import { getAmministratoreDashboardStats, getCondominiForAmministratore } from "@/lib/data/amministratore";
import { getSegnalazioniNonLette } from "@/lib/data/segnalazioni";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { SegnalazioniNonLetteBadge } from "@/components/segnalazioni/non-lette-badge";

export default async function AmministratoreDashboardPage() {
  const { session, amministratore } = await requireAmministratore();
  const [stats, condomini, nonLette] = await Promise.all([
    getAmministratoreDashboardStats(amministratore.id, session.user.id),
    getCondominiForAmministratore(amministratore.id),
    getSegnalazioniNonLette(session.user.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">{amministratore.ragioneSociale}</p>
        </div>
        <SegnalazioniNonLetteBadge count={nonLette} href="/amministratore/segnalazioni" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Condomini gestiti" value={String(stats.numeroCondomini)} icon={Building2} />
        <StatCard label="Unità totali" value={String(stats.unitaTotali)} icon={Home} />
        <StatCard
          label="Segnalazioni aperte"
          value={String(stats.segnalazioniAperte)}
          tone={stats.segnalazioniAperte > 0 ? "warning" : "default"}
          icon={MessageSquareWarning}
        />
      </div>

      <Card>
        <CardHeader title="I tuoi condomini" />
        {condomini.length === 0 ? (
          <EmptyState message="Nessun condominio registrato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Comune</TableHeaderCell>
                <TableHeaderCell>Unità</TableHeaderCell>
                <TableHeaderCell>Immobili collegati</TableHeaderCell>
                <TableHeaderCell>Segnalazioni</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {condomini.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/amministratore/condomini/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{c.comune}</TableCell>
                  <TableCell>{c.numeroUnita}</TableCell>
                  <TableCell>{c._count.immobili}</TableCell>
                  <TableCell>{c._count.segnalazioni}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
