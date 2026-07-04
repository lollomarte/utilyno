import Link from "next/link";
import { Building2, Home, MessageSquareWarning, AlertTriangle } from "lucide-react";
import { requireAmministratore } from "@/lib/auth-helpers";
import {
  getAmministratoreDashboardStats,
  getCondominiConStatistiche,
  getComunicazioniPerAmministratore,
} from "@/lib/data/amministratore";
import { getSegnalazioniNonLette } from "@/lib/data/segnalazioni";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SegnalazioniNonLetteBadge } from "@/components/segnalazioni/non-lette-badge";
import { formatDate } from "@/lib/utils";

export default async function AmministratoreDashboardPage() {
  const { session, amministratore } = await requireAmministratore();
  const [stats, condomini, nonLette, comunicazioni] = await Promise.all([
    getAmministratoreDashboardStats(amministratore.id, session.user.id),
    getCondominiConStatistiche(amministratore.id),
    getSegnalazioniNonLette(session.user.id),
    getComunicazioniPerAmministratore(amministratore.id),
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

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader title="I tuoi condomini" description={condomini.length > 5 ? "Anteprima — i primi 5 condomini" : undefined} />
          <Link href="/amministratore/condomini" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
        {condomini.length === 0 ? (
          <EmptyState message="Nessun condominio registrato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Comune</TableHeaderCell>
                <TableHeaderCell>Occupazione</TableHeaderCell>
                <TableHeaderCell>Segnalazioni</TableHeaderCell>
                <TableHeaderCell>Lead generati</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {condomini.slice(0, 5).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/amministratore/condomini/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{c.comune}</TableCell>
                  <TableCell>
                    {c.percentualeOccupazione !== null ? (
                      <>
                        {c.percentualeOccupazione.toFixed(0)}%{" "}
                        <span className="text-slate-400">
                          ({c.immobiliOccupati}/{c.immobiliCollegati})
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">Nessuna unità collegata</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>
                        {c.segnalazioniAperte} aperte &middot; {c.segnalazioniInLavorazione} in lavorazione
                      </span>
                      {c.haUrgenze && (
                        <span title={`Almeno una segnalazione ad alta priorità aperta da più di ${3} giorni`}>
                          <Badge tone="danger">
                            <AlertTriangle className="mr-1 inline h-3 w-3" />
                            Urgente
                          </Badge>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{c.leadGenerati}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader title="Comunicazioni recenti" description="Anteprima — le ultime 3 inviate" />
          <Link href="/amministratore/comunicazioni" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
        {comunicazioni.length === 0 ? (
          <EmptyState message="Nessuna comunicazione inviata finora." />
        ) : (
          <ul className="divide-y divide-slate-100 px-6 pb-2">
            {comunicazioni.slice(0, 3).map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-900">{c.titolo}</p>
                  <span className="whitespace-nowrap text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{c.condominio.nome}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
