import Link from "next/link";
import { getAllMatchResults } from "@/lib/data/matches";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/format";

export default async function RisultatiPage() {
  const matches = await getAllMatchResults();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Risultati</h1>
      {matches.length === 0 ? (
        <EmptyState>Nessuna partita registrata ancora.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {matches.map((m) => (
            <li key={m.match_id}>
              <Link
                href={`/risultati/${m.match_id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-line p-4 hover:border-ink transition-colors"
              >
                <div>
                  <p className="text-sm text-muted capitalize">{formatDate(m.data)}</p>
                  {m.note && <p className="text-xs text-muted mt-0.5">{m.note}</p>}
                </div>
                <p className="text-lg font-bold tabular-nums shrink-0">
                  {m.gol_bianca} – {m.gol_nera}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
