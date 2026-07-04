import Link from "next/link";
import { notFound } from "next/navigation";
import { getAmministratoreDetailForAdmin } from "@/lib/data/admin";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";

export default async function AmministratoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const amministratore = await getAmministratoreDetailForAdmin(id);

  if (!amministratore) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{amministratore.ragioneSociale}</h1>
        <p className="mt-1 text-sm text-slate-500">{amministratore.piva}</p>
      </div>

      <Card>
        <CardHeader title="Dati amministratore" />
        <DescriptionList
          items={[
            { label: "Ragione sociale", value: amministratore.ragioneSociale },
            { label: "Partita IVA", value: amministratore.piva },
            { label: "Indirizzo", value: amministratore.indirizzo },
            { label: "Email referente", value: amministratore.user.email },
            { label: "Telefono", value: amministratore.telefono ?? "-" },
          ]}
        />
      </Card>

      <Card className="p-0">
        <div className="p-6 pb-0">
          <CardHeader title="Condomini gestiti" />
        </div>
        {amministratore.condomini.length === 0 ? (
          <EmptyState message="Nessun condominio gestito da questo amministratore." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Comune</TableHeaderCell>
                <TableHeaderCell>Unità</TableHeaderCell>
                <TableHeaderCell>Immobili collegati</TableHeaderCell>
                <TableHeaderCell>Segnalazioni</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {amministratore.condomini.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-slate-900">{c.nome}</TableCell>
                  <TableCell>{c.comune}</TableCell>
                  <TableCell>{c.numeroUnita}</TableCell>
                  <TableCell>{c._count.immobili}</TableCell>
                  <TableCell>{c.segnalazioniTotali}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <p>
        <Link href="/admin/amministratori" className="text-sm text-slate-500 hover:underline">
          ← Torna a tutti gli amministratori
        </Link>
      </p>
    </div>
  );
}
