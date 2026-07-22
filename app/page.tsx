import Link from "next/link";
import { getLatestMatchFull, getMediaGolPerPartita } from "@/lib/data/matches";
import { topScorersOf } from "@/lib/data/matchHelpers";
import { getScorersStanding, getAttendanceStanding } from "@/lib/data/stats";
import { getGoleadeStats } from "@/lib/data/records";
import { formatDate, playerName } from "@/lib/format";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { RankBadge } from "@/components/RankBadge";
import { CountUp } from "@/components/CountUp";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Podium } from "@/components/Podium";
import { EmptyState } from "@/components/EmptyState";
import { StaggerList, StaggerItem } from "@/components/StaggerList";
import { TeamScore } from "@/components/TeamScore";
import { GoleadaChip } from "@/components/GoleadaChip";

export default async function HomePage() {
  const [latest, scorers, attendance, mediaGolPartita, goleadeStats] = await Promise.all([
    getLatestMatchFull(),
    getScorersStanding(),
    getAttendanceStanding(),
    getMediaGolPerPartita(),
    getGoleadeStats(),
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
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
                  Ultima partita
                </p>
                <p className="text-sm text-muted capitalize">{formatDate(latest.match.data)}</p>
              </div>
              {Math.abs(latest.result.gol_bianca - latest.result.gol_nera) >= 5 && <GoleadaChip />}
            </div>

            <div className="relative mt-4">
              <TeamScore golBianca={latest.result.gol_bianca} golNera={latest.result.gol_nera} size="lg" />
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

      {latest && (
        <section>
          <h2 className="font-display text-lg font-bold mb-3">Numeri del gruppo</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Media gol/partita" value={mediaGolPartita} decimals={2} />
            <StatTile label="Goleade (scarto ≥5)" value={goleadeStats.totalGoleade} />
          </div>
        </section>
      )}
    </div>
  );
}

function StatTile({ label, value, decimals = 0 }: { label: string; value: number; decimals?: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 text-center">
      <p className="font-display text-2xl font-bold tabular-nums">
        <CountUp value={value} decimals={decimals} />
      </p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
