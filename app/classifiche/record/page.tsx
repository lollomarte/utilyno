import Link from "next/link";
import { getRecordGoliPartita, getStrisciaPresenzeRecord, getGoleadeStats } from "@/lib/data/records";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { CountUp } from "@/components/CountUp";
import { EmptyState } from "@/components/EmptyState";
import { playerName, formatDateShort } from "@/lib/format";

export default async function RecordPage() {
  const [goli, striscia, goleade] = await Promise.all([
    getRecordGoliPartita(),
    getStrisciaPresenzeRecord(),
    getGoleadeStats(),
  ]);

  if (!goli && !striscia && goleade.totalGoleade === 0) {
    return <EmptyState>Nessun record disponibile ancora.</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-4">
      {goli && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted mb-3">🎯 Più gol in una partita</p>
          <Link href={`/giocatori/${goli.player.id}`} className="tap flex items-center gap-3">
            <PlayerAvatar player={goli.player} size={48} />
            <div className="flex-1">
              <p className="font-semibold">{playerName(goli.player)}</p>
              <p className="text-sm text-muted">{formatDateShort(goli.data)}</p>
            </div>
            <p className="font-display text-4xl font-bold text-accent tabular-nums">
              <CountUp value={goli.gol} />
            </p>
          </Link>
        </div>
      )}

      {striscia && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted mb-3">🔥 Striscia di presenze più lunga</p>
          <Link href={`/giocatori/${striscia.player.id}`} className="tap flex items-center gap-3">
            <PlayerAvatar player={striscia.player} size={48} />
            <div className="flex-1">
              <p className="font-semibold">{playerName(striscia.player)}</p>
              <p className="text-sm text-muted">partite consecutive</p>
            </div>
            <p className="font-display text-4xl font-bold text-accent tabular-nums">
              <CountUp value={striscia.streak} />
            </p>
          </Link>
        </div>
      )}

      {goleade.totalGoleade > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted">🔥 Goleade (scarto ≥5 gol)</p>
            <p className="font-display text-2xl font-bold text-orange-300 tabular-nums">
              <CountUp value={goleade.totalGoleade} />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goleade.topWinners.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
                  Più goleade vinte
                </p>
                <ul className="flex flex-col gap-1.5">
                  {goleade.topWinners.map((g) => (
                    <li key={g.player.id}>
                      <Link
                        href={`/giocatori/${g.player.id}`}
                        className="tap flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2"
                      >
                        <PlayerAvatar player={g.player} size={28} />
                        <span className="flex-1 text-sm truncate">{playerName(g.player)}</span>
                        <span className="font-display font-bold tabular-nums text-sm">{g.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {goleade.topLosers.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
                  Più goleade subite
                </p>
                <ul className="flex flex-col gap-1.5">
                  {goleade.topLosers.map((g) => (
                    <li key={g.player.id}>
                      <Link
                        href={`/giocatori/${g.player.id}`}
                        className="tap flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2"
                      >
                        <PlayerAvatar player={g.player} size={28} />
                        <span className="flex-1 text-sm truncate">{playerName(g.player)}</span>
                        <span className="font-display font-bold tabular-nums text-sm text-muted">
                          {g.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
