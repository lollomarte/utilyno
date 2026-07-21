import Link from "next/link";
import { getLatestMatchFull, topScorersOf } from "@/lib/data/matches";
import { getScorersStanding, getAttendanceStanding } from "@/lib/data/stats";
import { formatDate, playerName } from "@/lib/format";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamBadge } from "@/components/TeamBadge";
import { EmptyState } from "@/components/EmptyState";

export default async function HomePage() {
  const [latest, scorers, attendance] = await Promise.all([
    getLatestMatchFull(),
    getScorersStanding(),
    getAttendanceStanding(),
  ]);

  const topScorers = scorers.slice(0, 3);
  const topAttendance = attendance.standing.slice(0, 3);
  const capocannonieri = latest ? topScorersOf(latest.participants) : [];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-xl font-bold mb-3">Ultima partita</h1>
        {latest ? (
          <Link
            href={`/risultati/${latest.match.id}`}
            className="block rounded-2xl border border-line p-5 hover:border-ink transition-colors"
          >
            <p className="text-sm text-muted mb-3 capitalize">{formatDate(latest.match.data)}</p>
            <div className="flex items-center justify-center gap-4 text-2xl font-bold mb-4">
              <div className="flex-1 text-right flex items-center justify-end gap-2">
                <span>Bianca</span>
                <span className="w-3 h-3 rounded-full bg-bianca border border-ink" />
              </div>
              <span className="tabular-nums">
                {latest.result.gol_bianca} – {latest.result.gol_nera}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-nera" />
                <span>Nera</span>
              </div>
            </div>
            {capocannonieri.length > 0 && (
              <div className="flex items-center gap-2 justify-center text-sm border-t border-line pt-3">
                <span className="text-muted">Capocannoniere di giornata:</span>
                <span className="font-semibold flex items-center gap-1.5">
                  {capocannonieri.map((p) => playerName(p.player)).join(", ")}
                  <span className="text-muted font-normal">({capocannonieri[0].gol} gol)</span>
                </span>
              </div>
            )}
          </Link>
        ) : (
          <EmptyState>Nessuna partita registrata ancora.</EmptyState>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Top marcatori</h2>
          <Link href="/classifiche/marcatori" className="text-sm text-muted hover:text-ink">
            Classifica completa →
          </Link>
        </div>
        {topScorers.length > 0 ? (
          <ol className="flex flex-col gap-2">
            {topScorers.map((p, i) => (
              <li key={p.player_id}>
                <Link
                  href={`/giocatori/${p.player_id}`}
                  className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-ink transition-colors"
                >
                  <span className="w-5 text-muted font-semibold text-sm">{i + 1}</span>
                  <PlayerAvatar player={p} size={36} />
                  <span className="flex-1 font-medium">{playerName(p)}</span>
                  <span className="font-bold tabular-nums">{p.gol_totali} gol</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState>Ancora nessun gol segnato.</EmptyState>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Top presenze</h2>
          <Link href="/classifiche/presenze" className="text-sm text-muted hover:text-ink">
            Classifica completa →
          </Link>
        </div>
        {topAttendance.length > 0 ? (
          <ol className="flex flex-col gap-2">
            {topAttendance.map((p, i) => (
              <li key={p.player.id}>
                <Link
                  href={`/giocatori/${p.player.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-ink transition-colors"
                >
                  <span className="w-5 text-muted font-semibold text-sm">{i + 1}</span>
                  <PlayerAvatar player={p.player} size={36} />
                  <span className="flex-1 font-medium">{playerName(p.player)}</span>
                  <span className="font-bold tabular-nums">{p.presenze} presenze</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState>Ancora nessuna presenza registrata.</EmptyState>
        )}
      </section>
    </div>
  );
}
