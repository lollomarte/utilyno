import Link from "next/link";
import { getAllMatchResults } from "@/lib/data/matches";
import { DeleteMatchButton } from "@/components/admin/DeleteMatchButton";
import { EmptyState } from "@/components/EmptyState";
import { formatDateShort } from "@/lib/format";

export default async function AdminPartitePage() {
  const matches = await getAllMatchResults();

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold">Partite</h1>
        <Link
          href="/admin/partite/nuova"
          className="bg-ink text-paper rounded-full px-4 py-2 text-sm font-semibold"
        >
          + Nuova partita
        </Link>
      </div>

      {matches.length === 0 ? (
        <EmptyState>Nessuna partita registrata.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {matches.map((m) => (
            <li
              key={m.match_id}
              className="flex items-center gap-3 rounded-xl border border-line p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{formatDateShort(m.data)}</p>
                <p className="text-xs text-muted">
                  {m.gol_bianca} – {m.gol_nera} · {m.num_partecipanti} partecipanti
                </p>
              </div>
              <Link
                href={`/admin/partite/${m.match_id}`}
                className="text-sm text-muted hover:text-ink"
              >
                Modifica
              </Link>
              <DeleteMatchButton matchId={m.match_id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
