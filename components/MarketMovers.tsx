import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { playerName, formatMarketValue } from "@/lib/format";
import type { MarketPlayerRow } from "@/lib/data/market";

function MoverList({
  title,
  rows,
  positive,
}: {
  title: string;
  rows: MarketPlayerRow[];
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Nessun movimento significativo questo mese.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <li key={row.player.id}>
              <Link
                href={`/giocatori/${row.player.id}`}
                className="tap flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-surface-2"
              >
                <PlayerAvatar player={row.player} size={28} />
                <span className="flex-1 text-sm truncate">{playerName(row.player)}</span>
                <span
                  className={`text-sm font-display font-bold tabular-nums shrink-0 ${
                    positive ? "text-accent" : "text-red-400"
                  }`}
                >
                  {positive ? "▲" : "▼"} {formatMarketValue(Math.abs(row.trend ?? 0))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MarketMovers({
  risers,
  fallers,
}: {
  risers: MarketPlayerRow[];
  fallers: MarketPlayerRow[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <MoverList title="📈 Top rialzi" rows={risers} positive />
      <MoverList title="📉 Top ribassi" rows={fallers} positive={false} />
    </div>
  );
}
