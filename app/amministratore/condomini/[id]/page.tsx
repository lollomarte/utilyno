import { notFound } from "next/navigation";
import { requireAmministratore } from "@/lib/auth-helpers";
import { getCondominioDetail } from "@/lib/data/amministratore";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoSegnalazioneBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { STATO_SEGNALAZIONE_LABELS } from "@/lib/labels";

export default async function CondominioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { amministratore } = await requireAmministratore();
  const condominio = await getCondominioDetail(id, amministratore.id);

  if (!condominio) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{condominio.nome}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {condominio.indirizzo}, {condominio.comune}
        </p>
      </div>

      <Card>
        <CardHeader title="Dati condominio" />
        <DescriptionList
          items={[
            { label: "Indirizzo", value: `${condominio.indirizzo}, ${condominio.comune}` },
            { label: "Numero unità", value: String(condominio.numeroUnita) },
            { label: "Immobili collegati su LOQO", value: String(condominio.immobili.length) },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Immobili e occupanti" />
        {condominio.immobili.length === 0 ? (
          <EmptyState message="Nessun immobile di questo condominio è ancora collegato a LOQO." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Immobile</TableHeaderCell>
                <TableHeaderCell>Proprietario</TableHeaderCell>
                <TableHeaderCell>Inquilino</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {condominio.immobili.map((immobile) => (
                <TableRow key={immobile.id}>
                  <TableCell>{immobile.indirizzo}</TableCell>
                  <TableCell>
                    {immobile.proprietario.user.nome} {immobile.proprietario.user.cognome}
                  </TableCell>
                  <TableCell>
                    {immobile.contratti[0]
                      ? `${immobile.contratti[0].inquilino.user.nome} ${immobile.contratti[0].inquilino.user.cognome}`
                      : "Libero"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Segnalazioni condominiali" />
        {condominio.segnalazioni.length === 0 ? (
          <EmptyState message="Nessuna segnalazione per questo condominio." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Titolo</TableHeaderCell>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Priorità</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {condominio.segnalazioni.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.titolo}</TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  <TableCell>{s.priorita}</TableCell>
                  <TableCell>
                    <StatoSegnalazioneBadge stato={s.stato} label={STATO_SEGNALAZIONE_LABELS[s.stato]} />
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
