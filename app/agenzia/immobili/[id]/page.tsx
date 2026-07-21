import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAgenzia } from "@/lib/auth-helpers";
import { getImmobileDetailForAgenzia } from "@/lib/data/agenzia";
import { getUtenzeComplete, getFornitoriPerTutteLeUtenze } from "@/lib/data/utenze";
import { getFornitoriAssicurazione } from "@/lib/data/assicurazioni";
import { UtenzeSection } from "@/components/utenze/utenze-section";
import { AssicurazioneSection } from "@/components/assicurazioni/assicurazione-section";
import { ModificaImmobileButton } from "@/components/immobili/modifica-immobile-button";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoContrattoBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TIPO_IMMOBILE_LABELS, STATO_CONTRATTO_LABELS } from "@/lib/labels";
import { datiAggiuntiviImmobileRows } from "@/lib/immobili/datiAggiuntiviImmobileRows";

export default async function AgenziaImmobileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { agenzia } = await requireAgenzia();
  const immobile = await getImmobileDetailForAgenzia(id, agenzia.id);

  if (!immobile) {
    notFound();
  }

  const [utenze, fornitoriPerTipo, fornitoriAssicurazione] = await Promise.all([
    getUtenzeComplete(immobile.id),
    getFornitoriPerTutteLeUtenze(),
    getFornitoriAssicurazione(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {immobile.indirizzo}, {immobile.comune}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{TIPO_IMMOBILE_LABELS[immobile.tipoImmobile]}</p>
        </div>
        <ModificaImmobileButton immobile={immobile} />
      </div>

      <Card>
        <CardHeader title="Dati immobile" />
        <DescriptionList
          items={[
            { label: "Indirizzo", value: `${immobile.indirizzo}, ${immobile.comune} (${immobile.provincia})` },
            { label: "Dati catastali", value: immobile.datiCatastali },
            { label: "Superficie", value: `${immobile.superficieMq} m²` },
            { label: "Classe APE", value: immobile.apeClasse ?? "-" },
            { label: "Valore stimato", value: formatCurrency(immobile.valoreStimato) },
            { label: "Proprietario", value: `${immobile.proprietario.user.nome} ${immobile.proprietario.user.cognome}` },
            { label: "Condominio", value: immobile.condominio?.nome ?? "-" },
            ...datiAggiuntiviImmobileRows(immobile),
          ]}
        />
      </Card>

      <Card className="p-0">
        <div className="p-6 pb-0">
          <CardHeader title="Contratti" />
        </div>
        {immobile.contratti.length === 0 ? (
          <EmptyState message="Nessun contratto per questo immobile." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Inquilino</TableHeaderCell>
                <TableHeaderCell>Periodo</TableHeaderCell>
                <TableHeaderCell>Canone</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {immobile.contratti.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/agenzia/contratti/${c.id}`} className="font-medium text-ink hover:underline">
                      {c.inquilino.user.nome} {c.inquilino.user.cognome}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatDate(c.dataInizio)} - {formatDate(c.dataFine)}
                  </TableCell>
                  <TableCell>{formatCurrency(c.canoneMensile)}</TableCell>
                  <TableCell>
                    <StatoContrattoBadge stato={c.stato} label={STATO_CONTRATTO_LABELS[c.stato]} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <UtenzeSection immobileId={immobile.id} utenze={utenze} fornitoriPerTipo={fornitoriPerTipo} />

      <AssicurazioneSection
        immobileId={immobile.id}
        assicurazione={immobile.assicurazioni[0] ?? null}
        fornitoriDisponibili={fornitoriAssicurazione}
      />
    </div>
  );
}
