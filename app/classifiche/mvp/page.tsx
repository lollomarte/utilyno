import Link from "next/link";
import { getMvpStandings } from "@/lib/data/stats";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { EmptyState } from "@/components/EmptyState";
import { playerName } from "@/lib/format";

export default async function MvpPage() {
  const data = await getMvpStandings();

  if (data.length === 0) {
    return <EmptyState>Nessun MVP assegnato ancora.</EmptyState>;
  }

  return (
    <ol className="flex flex-col gap-2">
      {data.map((p, i) => (
        <li key={p.player_id}>
          <Link
            href={`/giocatori/${p.player_id}`}
            className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-ink transition-colors"
          >
            <span className="w-5 text-muted font-semibold text-sm">{i + 1}</span>
            <PlayerAvatar player={p} size={36} />
            <span className="flex-1 font-medium">{playerName(p)}</span>
            <span className="font-bold tabular-nums">
              {p.mvp_count} {p.mvp_count === 1 ? "MVP" : "MVP"}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
