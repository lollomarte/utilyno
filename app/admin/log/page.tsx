import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { getLogAzioni, getUtentiConLogAzioni } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
import type { EntitaAudit } from "@/lib/audit/registraLogAzione";

const ENTITA_OPTIONS: EntitaAudit[] = ["Contratto", "Pagamento", "Deposito", "Documento"];

export default async function AdminLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entita?: string; userId?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const entita = (params.entita as EntitaAudit) || undefined;
  const userId = params.userId || undefined;

  const [log, utenti] = await Promise.all([getLogAzioni({ entita, userId }), getUtentiConLogAzioni()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Log azioni</h1>
        <p className="mt-1 text-sm text-slate-500">
          Registro delle azioni su Contratti, Pagamenti e Depositi — ultime {log.length} voci
        </p>
      </div>

      <Card>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-4" method="get">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Entità</label>
            <Select name="entita" defaultValue={entita ?? ""}>
              <option value="">Tutte</option>
              {ENTITA_OPTIONS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Utente</label>
            <Select name="userId" defaultValue={userId ?? ""}>
              <option value="">Tutti</option>
              {utenti.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} {u.cognome} &middot; {u.email}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-4 flex justify-end gap-2">
            <Link href="/admin/log">
              <Button type="button" variant="secondary">
                Reimposta
              </Button>
            </Link>
            <Button type="submit">Filtra</Button>
          </div>
        </form>
      </Card>

      <Card className="p-0">
        {log.length === 0 ? (
          <EmptyState message="Nessuna azione registrata per questi filtri." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Utente</TableHeaderCell>
                <TableHeaderCell>Azione</TableHeaderCell>
                <TableHeaderCell>Entità</TableHeaderCell>
                <TableHeaderCell>Nota</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {log.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{formatDateTime(l.createdAt)}</TableCell>
                  <TableCell>
                    {l.autore ? `${l.autore.nome} ${l.autore.cognome}` : <span className="text-slate-400">Utente rimosso</span>}
                  </TableCell>
                  <TableCell className="font-medium text-ink">{l.azione}</TableCell>
                  <TableCell>
                    {l.entita} <span className="text-slate-400">#{l.entitaId.slice(0, 8)}</span>
                  </TableCell>
                  <TableCell className="text-slate-500">{l.note ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
