import { getGuessGameLeaderboard } from "@/lib/data/game";
import { RankBadge } from "@/components/RankBadge";
import { CountUp } from "@/components/CountUp";
import { EmptyState } from "@/components/EmptyState";
import { StaggerList, StaggerItem } from "@/components/StaggerList";

export default async function GiocoClassificaPage() {
  const data = await getGuessGameLeaderboard();

  if (data.length === 0) {
    return <EmptyState>Nessun record ancora: gioca la prima partita e mettici il tuo nome 🏆</EmptyState>;
  }

  return (
    <StaggerList className="flex flex-col gap-2">
      {data.map((row, i) => (
        <StaggerItem key={row.nickname}>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
            <RankBadge rank={i + 1} />
            <span className="flex-1 font-medium truncate">{row.nickname}</span>
            <span className="font-display font-bold text-accent tabular-nums">
              <CountUp value={row.punteggio} />
            </span>
          </div>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
