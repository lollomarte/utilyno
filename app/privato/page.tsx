import Link from "next/link";
import { requirePrivato } from "@/lib/auth-helpers";
import { getImmobiliUtente } from "@/lib/immobili/getImmobiliUtente";
import { PortalShell } from "@/components/layout/portal-shell";
import { AggiungiImmobileButton } from "@/components/privato/aggiungi-immobile-button";
import type { NavItem } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { RelazioneImmobileBadge } from "@/components/ui/badge";

const NAV_ITEMS: NavItem[] = [{ href: "/privato", label: "I miei immobili" }];

export default async function PrivatoPage() {
  const { session } = await requirePrivato();
  const immobili = await getImmobiliUtente(session.user.id);

  return (
    <PortalShell
      portalLabel="I miei immobili"
      roleLabel="Privato"
      navItems={NAV_ITEMS}
      nome={session.user.nome}
      cognome={session.user.cognome}
      userId={session.user.id}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink">I miei immobili</h1>
            <p className="mt-1 text-sm text-slate-500">
              Tutti gli immobili collegati al tuo account, come proprietario o come inquilino.
            </p>
          </div>
          <AggiungiImmobileButton />
        </div>

        <Card className="p-0">
          {immobili.length === 0 ? (
            <EmptyState message="Nessun immobile associato al tuo account." action={<AggiungiImmobileButton />} />
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
                      <Link href={`/privato/${immobile.id}`} className="font-medium text-ink hover:underline">
                        {immobile.indirizzo}, {immobile.comune}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <RelazioneImmobileBadge relazione={immobile.relazione} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/privato/${immobile.id}`} className="text-sm font-medium text-primary hover:underline">
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
    </PortalShell>
  );
}
