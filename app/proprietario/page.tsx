import Link from "next/link";
import { requireProprietario } from "@/lib/auth-helpers";
import { getImmobiliForProprietario, getProprietarioDashboardStats } from "@/lib/data/proprietario";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TIPO_IMMOBILE_LABELS } from "@/lib/labels";

export default async function ProprietarioDashboardPage() {
  const { proprietario } = await requireProprietario();
  const [immobili, stats] = await Promise.all([
    getImmobiliForProprietario(proprietario.id),
    getProprietarioDashboardStats(proprietario.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Panoramica del tuo portfolio immobiliare</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Immobili" value={String(stats.numeroImmobili)} />
        <StatCard label="Canone medio" value={formatCurrency(stats.canoneMedio)} />
        <StatCard
          label="Occupazione"
          value={`${stats.immobiliOccupati}/${stats.numeroImmobili}`}
          hint="Immobili con contratto attivo"
        />
        <StatCard label="Incassi previsti (30gg)" value={String(stats.prossimiIncassi.length)} hint="Pagamenti in arrivo" />
      </div>

      <Card>
        <CardHeader title="I tuoi immobili" />
        {immobili.length === 0 ? (
          <EmptyState message="Nessun immobile associato." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Indirizzo</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Valore stimato</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {immobili.map((immobile) => (
                <TableRow key={immobile.id}>
                  <TableCell>
                    <Link href={`/proprietario/immobili/${immobile.id}`} className="font-medium text-slate-900 hover:underline">
                      {immobile.indirizzo}, {immobile.comune}
                    </Link>
                  </TableCell>
                  <TableCell>{TIPO_IMMOBILE_LABELS[immobile.tipoImmobile]}</TableCell>
                  <TableCell>{formatCurrency(immobile.valoreStimato)}</TableCell>
                  <TableCell>
                    {immobile.contratti.length > 0 ? (
                      <Badge tone="success">Occupato</Badge>
                    ) : (
                      <Badge tone="neutral">Libero</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Prossimi incassi" />
        {stats.prossimiIncassi.length === 0 ? (
          <EmptyState message="Nessun incasso previsto nei prossimi 30 giorni." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Scadenza</TableHeaderCell>
                <TableHeaderCell>Importo</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.prossimiIncassi.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.contratto.immobile.indirizzo}, {p.contratto.immobile.comune}
                  </TableCell>
                  <TableCell>{formatDate(p.dataScadenza)}</TableCell>
                  <TableCell>{formatCurrency(p.importo)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
