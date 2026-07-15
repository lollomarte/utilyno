import Link from "next/link";
import { requirePrivato } from "@/lib/auth-helpers";
import { getImmobiliUtente } from "@/lib/immobili/getImmobiliUtente";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { RelazioneImmobileBadge } from "@/components/ui/badge";

/** Dove porta la riga di un immobile: nel portale già esistente per quella relazione. Il
 * portale Proprietario ha una pagina di dettaglio per immobile; il portale Inquilino è oggi
 * pensato per un solo contratto alla volta, quindi porta all'ingresso del portale. */
function hrefImmobile(immobile: { id: string; relazione: "PROPRIETARIO" | "INQUILINO" }): string {
  return immobile.relazione === "PROPRIETARIO" ? `/proprietario/immobili/${immobile.id}` : "/inquilino";
}

export default async function CasaPage() {
  const { session } = await requirePrivato();
  const immobili = await getImmobiliUtente(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">I miei immobili</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tutti gli immobili collegati al tuo account, come proprietario o come inquilino.
        </p>
      </div>

      <Card className="p-0">
        {immobili.length === 0 ? (
          <EmptyState message="Nessun immobile associato al tuo account." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Indirizzo</TableHeaderCell>
                <TableHeaderCell>Ruolo</TableHeaderCell>
                <TableHeaderCell>{""}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {immobili.map((immobile) => (
                <TableRow key={`${immobile.relazione}-${immobile.id}`}>
                  <TableCell>
                    <Link href={hrefImmobile(immobile)} className="font-medium text-ink hover:underline">
                      {immobile.indirizzo}, {immobile.comune}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <RelazioneImmobileBadge relazione={immobile.relazione} />
                  </TableCell>
                  <TableCell>
                    <Link href={hrefImmobile(immobile)} className="text-sm font-medium text-primary hover:underline">
                      Apri
                    </Link>
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
