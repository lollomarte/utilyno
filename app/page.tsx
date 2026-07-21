import Link from "next/link";
import { getLatestMatchFull, topScorersOf } from "@/lib/data/matches";
import { getScorersStanding, getAttendanceStanding } from "@/lib/data/stats";
import { formatDate, playerName } from "@/lib/format";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { RankBadge } from "@/components/RankBadge";
import { CountUp } from "@/components/CountUp";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Podium } from "@/components/Podium";
import { EmptyState } from "@/components/EmptyState";
import { StaggerList, StaggerItem } from "@/components/StaggerList";

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
        {latest ? (
          <Link
            href={`/risultati/${latest.match.id}`}
            className="tap block rounded-3xl border border-line-strong bg-surface p-6 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, #ffffff 0%, transparent 48%, transparent 52%, #000000 100%)",
              }}
            />
            <p className="relative text-xs uppercase tracking-widest text-accent font-semibold mb-1">
              Ultima partita
            </p>
            <p className="relative text-sm text-muted mb-4 capitalize">{formatDate(latest.match.data)}</p>

            <div className="relative flex items-center justify-center gap-3 sm:gap-6">
              <div className="flex-1 text-right">
                <span className="font-display text-xs sm:text-sm tracking-wide text-muted">BIANCA</span>
              </div>
              <div className="font-display font-bold text-5xl sm:text-6xl tabular-nums flex items-center gap-2 sm:gap-3">
                <CountUp value={latest.result.gol_bianca} duration={0.8} />
                <span className="text-muted text-3xl sm:text-4xl">–</span>
                <CountUp value={latest.result.gol_nera} duration={0.8} />
              </div>
              <div className="flex-1">
                <span className="font-display text-xs sm:text-sm tracking-wide text-muted">NERA</span>
              </div>
            </div>

            {capocannonieri.length > 0 && (
              <div className="relative flex items-center gap-3 justify-center mt-5 pt-4 border-t border-line">
                <PlayerAvatar player={capocannonieri[0].player} size={40} />
                <div className="text-left">
                  <p className="text-[11px] uppercase tracking-wide text-muted">Capocannoniere di giornata</p>
                  <p className="font-semibold text-sm">
                    {capocannonieri.map((p) => playerName(p.player)).join(", ")}{" "}
                    <span className="text-accent font-display">({capocannonieri[0].gol} gol)</span>
                  </p>
                </div>
              </div>
            )}
          </Link>
        ) : (
          <EmptyState>Nessuna partita registrata ancora.</EmptyState>
        )}

        <div className="mt-4 flex justify-center">
          <CountdownTimer />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">Top marcatori</h2>
          <Link href="/classifiche/marcatori" className="text-sm text-muted hover:text-ink">
            Classifica completa →
          </Link>
        </div>
        {topScorers.length > 0 ? (
          <Podium entries={topScorers} />
        ) : (
          <EmptyState>Ancora nessun gol segnato.</EmptyState>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Top presenze</h2>
          <Link href="/classifiche/presenze" className="text-sm text-muted hover:text-ink">
            Classifica completa →
          </Link>
        </div>
        {topAttendance.length > 0 ? (
          <StaggerList className="flex flex-col gap-2">
            {topAttendance.map((p, i) => (
              <StaggerItem key={p.player.id}>
                <Link
                  href={`/giocatori/${p.player.id}`}
                  className="tap flex items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:border-line-strong transition-colors"
                >
                  <RankBadge rank={i + 1} />
                  <PlayerAvatar player={p.player} size={36} rank={i + 1} />
                  <span className="flex-1 font-medium">{playerName(p.player)}</span>
                  <span className="font-display font-bold tabular-nums">
                    <CountUp value={p.presenze} /> <span className="text-muted font-sans text-xs">pres.</span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        ) : (
          <EmptyState>Ancora nessuna presenza registrata.</EmptyState>
        )}
      </section>
    </div>
  );
}
