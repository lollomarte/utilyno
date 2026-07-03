import { notFound } from "next/navigation";
import { requireAmministratore } from "@/lib/auth-helpers";
import { getCondominioDetail, getComunicazioniForCondominio } from "@/lib/data/amministratore";
import { NuovaComunicazioneForm } from "@/components/amministratore/nuova-comunicazione-form";
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

  const comunicazioni = await getComunicazioniForCondominio(id, amministratore.id);

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
                <TableHeaderCell>Unità</TableHeaderCell>
                <TableHeaderCell>Destinatari</TableHeaderCell>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Priorità</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {condominio.segnalazioni.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.titolo}</TableCell>
                  <TableCell>{s.immobile?.indirizzo ?? "Generale"}</TableCell>
                  <TableCell>
                    {!s.immobileId
                      ? "-"
                      : s.notificaInquilino && s.notificaProprietario
                        ? "Inquilino + Proprietario"
                        : s.notificaInquilino
                          ? "Inquilino"
                          : s.notificaProprietario
                            ? "Proprietario"
                            : "-"}
                  </TableCell>
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

      <Card>
        <CardHeader title="Invia comunicazione a tutto il condominio" description="Raggiunge tutti gli inquilini e i proprietari con un'unità in questo condominio" />
        <NuovaComunicazioneForm condominioId={condominio.id} />
      </Card>

      <Card>
        <CardHeader title="Comunicazioni inviate" />
        {comunicazioni.length === 0 ? (
          <EmptyState message="Nessuna comunicazione inviata a questo condominio." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {comunicazioni.map((c) => (
              <li key={c.id} className="py-3">
                <p className="text-sm font-medium text-slate-900">{c.titolo}</p>
                <p className="mt-1 text-sm text-slate-500">{c.testo}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(c.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
