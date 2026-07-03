import Link from "next/link";
import { requireAgenzia } from "@/lib/auth-helpers";
import { getImmobiliForAgenzia } from "@/lib/data/agenzia";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { TIPO_IMMOBILE_LABELS } from "@/lib/labels";

export default async function ImmobiliPage() {
  const { agenzia } = await requireAgenzia();
  const immobili = await getImmobiliForAgenzia(agenzia.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Immobili</h1>
          <p className="mt-1 text-sm text-slate-500">Il portfolio immobiliare gestito dalla tua agenzia</p>
        </div>
        <Link href="/agenzia/immobili/nuovo">
          <Button>Nuovo immobile</Button>
        </Link>
      </div>

      <Card className="p-0">
        {immobili.length === 0 ? (
          <EmptyState message="Nessun immobile registrato. Crea il primo immobile per iniziare." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Indirizzo</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Proprietario</TableHeaderCell>
                <TableHeaderCell>Condominio</TableHeaderCell>
                <TableHeaderCell>Valore stimato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {immobili.map((immobile) => (
                <TableRow key={immobile.id}>
                  <TableCell>
                    <span className="font-medium text-slate-900">
                      {immobile.indirizzo}, {immobile.comune}
                    </span>
                  </TableCell>
                  <TableCell>{TIPO_IMMOBILE_LABELS[immobile.tipoImmobile]}</TableCell>
                  <TableCell>
                    {immobile.proprietario.user.nome} {immobile.proprietario.user.cognome}
                  </TableCell>
                  <TableCell>{immobile.condominio?.nome ?? "-"}</TableCell>
                  <TableCell>{formatCurrency(immobile.valoreStimato)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
