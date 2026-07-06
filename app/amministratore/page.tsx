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
import { CountUp } from "@/components/ui/count-up";
import { AttentionBlock, type AttentionItem } from "@/components/dashboard/attention-block";
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

  const condominiUrgenti = condomini.filter((c) => c.haUrgenze);
  const attentionItems: AttentionItem[] = [];
  if (condominiUrgenti.length > 0) {
    attentionItems.push({
      icon: AlertTriangle,
      tone: "danger",
      label:
        condominiUrgenti.length === 1
          ? `Segnalazione urgente in ${condominiUrgenti[0].nome}`
          : `${condominiUrgenti.length} condomini con segnalazioni urgenti`,
      href: "/amministratore/segnalazioni",
    });
  }
  if (stats.segnalazioniAperte > 0) {
    attentionItems.push({
      icon: MessageSquareWarning,
      tone: "warning",
      label:
        stats.segnalazioniAperte === 1
          ? "1 segnalazione aperta o in lavorazione"
          : `${stats.segnalazioniAperte} segnalazioni aperte o in lavorazione`,
      href: "/amministratore/segnalazioni",
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">{amministratore.ragioneSociale}</p>
        </div>
        <SegnalazioniNonLetteBadge count={nonLette} href="/amministratore/segnalazioni" />
      </div>

      <AttentionBlock items={attentionItems} />

      <div className="stagger-cards grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Condomini gestiti" value={<CountUp value={stats.numeroCondomini} />} icon={Building2} />
        <StatCard label="Unità totali" value={<CountUp value={stats.unitaTotali} />} icon={Home} />
        <StatCard
          label="Segnalazioni aperte"
          value={<CountUp value={stats.segnalazioniAperte} />}
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
                    <Link href={`/amministratore/condomini/${c.id}`} className="font-medium text-ink hover:underline">
                      {c.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{c.comune}</TableCell>
                  <TableCell>
                    {c.percentualeOccupazione !== null ? (
                      <>
                        {c.percentualeOccupazione.toFixed(0)}%{" "}
                        <span className="text-ink-subtle">
                          ({c.immobiliOccupati}/{c.immobiliCollegati})
                        </span>
                      </>
                    ) : (
                      <span className="text-ink-subtle">Nessuna unità collegata</span>
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
          <ul className="divide-y divide-border/60 px-6 pb-2">
            {comunicazioni.slice(0, 3).map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-ink">{c.titolo}</p>
                  <span className="whitespace-nowrap text-xs text-ink-subtle">{formatDate(c.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-subtle">{c.condominio.nome}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
