import { requireAmministratore } from "@/lib/auth-helpers";
import { getSegnalazioniForAmministratore, getCondominiForAmministratore } from "@/lib/data/amministratore";
import { NuovaSegnalazioneForm } from "@/components/amministratore/nuova-segnalazione-form";
import { StatoSegnalazioneSelect } from "@/components/amministratore/stato-segnalazione-select";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default async function SegnalazioniPage() {
  const { amministratore } = await requireAmministratore();
  const [segnalazioni, condomini] = await Promise.all([
    getSegnalazioniForAmministratore(amministratore.id),
    getCondominiForAmministratore(amministratore.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Segnalazioni condominiali</h1>
        <p className="mt-1 text-sm text-slate-500">Gestisci problematiche, interventi e stato delle segnalazioni</p>
      </div>

      <Card>
        <CardHeader title="Nuova segnalazione" />
        <NuovaSegnalazioneForm condomini={condomini} />
      </Card>

      <Card className="p-0">
        {segnalazioni.length === 0 ? (
          <EmptyState message="Nessuna segnalazione registrata." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Titolo</TableHeaderCell>
                <TableHeaderCell>Condominio</TableHeaderCell>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Priorità</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {segnalazioni.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.titolo}</TableCell>
                  <TableCell>{s.condominio.nome}</TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  <TableCell>{s.priorita}</TableCell>
                  <TableCell>
                    <StatoSegnalazioneSelect segnalazioneId={s.id} statoAttuale={s.stato} />
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
