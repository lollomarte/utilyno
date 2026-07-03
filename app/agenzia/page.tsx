import Link from "next/link";
import { requireAgenzia } from "@/lib/auth-helpers";
import { getAgenziaDashboardStats, getContrattiInScadenza } from "@/lib/data/agenzia";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AgenziaDashboardPage() {
  const { agenzia } = await requireAgenzia();
  const stats = await getAgenziaDashboardStats(agenzia.id);
  const contrattiInScadenza = await getContrattiInScadenza(agenzia.id, 60);
  const leadReListing = await getContrattiInScadenza(agenzia.id, 90);

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
        <CardHeader title="Contratti in scadenza nei prossimi 60 giorni" description="Promemoria operativo per rinnovi e adempimenti" />
        {contrattiInScadenza.length === 0 ? (
          <EmptyState message="Nessun contratto in scadenza a breve." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Inquilino</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Opportunità di re-listing"
          description="Contratti in scadenza nei prossimi 90 giorni: potenziali immobili da rimettere sul mercato"
        />
        {leadReListing.length === 0 ? (
          <EmptyState message="Nessuna opportunità di re-listing nei prossimi 90 giorni." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Proprietario</TableHeaderCell>
                <TableHeaderCell>Canone attuale</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leadReListing.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/agenzia/contratti/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.immobile.indirizzo}, {c.immobile.comune}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {c.immobile.proprietario.user.nome} {c.immobile.proprietario.user.cognome}
                  </TableCell>
                  <TableCell>{formatCurrency(c.canoneMensile)}</TableCell>
                  <TableCell>{formatDate(c.dataFine)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
