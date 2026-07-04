import Link from "next/link";
import { Building2, Users, FileText, AlertTriangle, Euro, PiggyBank } from "lucide-react";
import {
  getAdminDashboardStats,
  getAgenzieConPortfolio,
  getAmministratoriConPortfolio,
  getDistribuzionePagamenti,
  getPoolDepositiPerAgenzia,
} from "@/lib/data/admin";
import { aggiornaPagamentiScaduti } from "@/lib/pagamenti/aggiornaStatiScaduti";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { PagamentiDonut } from "@/components/charts/pagamenti-donut";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await aggiornaPagamentiScaduti();
  const [stats, agenzie, amministratori, distribuzionePagamenti, poolDepositiPerAgenzia] = await Promise.all([
    getAdminDashboardStats(),
    getAgenzieConPortfolio(),
    getAmministratoriConPortfolio(),
    getDistribuzionePagamenti(),
    getPoolDepositiPerAgenzia(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Vista aggregata sulla piattaforma LOQO</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Agenzie" value={String(stats.numeroAgenzie)} icon={Building2} />
        <StatCard label="Amministratori di condominio" value={String(stats.numeroAmministratori)} icon={Users} />
        <StatCard
          label="Contratti totali"
          value={String(stats.numeroContratti)}
          hint={`${stats.contrattiAttivi} attivi`}
          icon={FileText}
        />
        <StatCard
          label="Pagamenti in ritardo"
          value={String(stats.pagamentiInRitardo)}
          tone={stats.pagamentiInRitardo > 0 ? "danger" : "default"}
          icon={AlertTriangle}
        />
        <StatCard
          label="Volume transitato stimato"
          value={formatCurrency(stats.volumeIncassato)}
          hint="Totale storico incassato"
          icon={Euro}
        />
        <StatCard
          label="Pool depositi totale"
          value={formatCurrency(stats.poolDepositiTotale)}
          hint={`${stats.numeroDepositiVersati} depositi versati`}
          icon={PiggyBank}
        />
      </div>

      <Card>
        <CardHeader title="Distribuzione stato pagamenti" description="Tutti i contratti della piattaforma" />
        <PagamentiDonut data={distribuzionePagamenti} />
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader title="Depositi per agenzia" description="Anteprima — le prime 3 agenzie per depositi versati" />
          <Link href="/admin/depositi" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
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
              {poolDepositiPerAgenzia.slice(0, 3).map((a) => (
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

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader title="Agenzie e relativo portfolio" description="Anteprima — le prime 3 agenzie" />
          <Link href="/admin/agenzie" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
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
              {agenzie.slice(0, 3).map((agenzia) => (
                <TableRow key={agenzia.id}>
                  <TableCell>
                    <Link href={`/admin/agenzie/${agenzia.id}`} className="font-medium text-ink hover:underline">
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

      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <CardHeader title="Amministratori di condominio" description="Anteprima — i primi 3 amministratori" />
          <Link href="/admin/amministratori" className="whitespace-nowrap text-sm font-medium text-primary hover:underline">
            Vedi tutto
          </Link>
        </div>
        {amministratori.length === 0 ? (
          <EmptyState message="Nessun amministratore di condominio registrato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Amministratore</TableHeaderCell>
                <TableHeaderCell>Condomini gestiti</TableHeaderCell>
                <TableHeaderCell>Unità totali</TableHeaderCell>
                <TableHeaderCell>Segnalazioni</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {amministratori.slice(0, 3).map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link href={`/admin/amministratori/${a.id}`} className="font-medium text-ink hover:underline">
                      {a.ragioneSociale}
                    </Link>
                  </TableCell>
                  <TableCell>{a.numeroCondomini}</TableCell>
                  <TableCell>{a.unitaTotali}</TableCell>
                  <TableCell>{a.segnalazioniTotali}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
