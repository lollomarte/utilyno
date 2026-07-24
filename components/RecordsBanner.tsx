import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { playerName } from "@/lib/format";
import type { CurrentYearVsRecord, GroupTotals, YearGoalLeader } from "@/lib/recordStats";

export function RecordsBanner({
  totals,
  yearComparison,
}: {
  totals: GroupTotals;
  yearComparison: CurrentYearVsRecord;
}) {
  const { currentYear, currentYearLeaders, currentYearGoals, recordYear } = yearComparison;
  const showYearComparison = currentYearLeaders.length > 0 || !!recordYear;

  return (
    <div className="rounded-3xl border border-line-strong bg-surface p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.10),transparent_60%)] pointer-events-none" />
      <div className="relative flex flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
            I numeri del gruppo
          </p>
          <h1 className="font-display text-2xl font-bold">Da sempre, in cifre</h1>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <BigStat label="Partite giocate" value={totals.totalMatches} />
          <BigStat label="Gol segnati" value={totals.totalGoals} />
          <BigStat label="Media gol/partita" value={totals.avgGoalsPerMatch} decimals={2} />
        </div>

        {showYearComparison && (
          <div className="pt-4 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-3">
            <YearBlock
              label={`Capocannoniere ${currentYear}`}
              leaders={currentYearLeaders}
              value={currentYearGoals}
            />
            {recordYear && (
              <YearBlock
                label="🏆 Record storico gol in un anno"
                leaders={recordYear.leaders}
                value={recordYear.gol}
                gold
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BigStat({ label, value, decimals = 0 }: { label: string; value: number; decimals?: number }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="font-display text-3xl sm:text-4xl font-bold tabular-nums leading-none">
        <CountUp value={value} decimals={decimals} />
      </span>
      <span className="text-[11px] uppercase tracking-widest text-muted mt-1.5">{label}</span>
    </div>
  );
}

function YearBlock({
  label,
  leaders,
  value,
  gold = false,
}: {
  label: string;
  leaders: YearGoalLeader[];
  value: number;
  gold?: boolean;
}) {
  if (leaders.length === 0) return null;
  return (
    <div
      className={`rounded-2xl p-3 border ${gold ? "bg-gold/10 border-gold/30" : "bg-surface-2 border-line"}`}
    >
      <p className="text-[11px] uppercase tracking-widest text-muted mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2 shrink-0">
          {leaders.slice(0, 3).map((l) => (
            <Link key={l.player.id} href={`/giocatori/${l.player.id}`} className="tap">
              <PlayerAvatar player={l.player} size={32} />
            </Link>
          ))}
        </div>
        <p className="flex-1 min-w-0 text-sm font-medium truncate">
          {leaders.map((l) => playerName(l.player)).join(", ")}
        </p>
        <span className={`font-display text-2xl font-bold tabular-nums shrink-0 ${gold ? "text-gold" : ""}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
