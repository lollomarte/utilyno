import Link from "next/link";
import { getMvpStandings } from "@/lib/data/stats";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { RankBadge } from "@/components/RankBadge";
import { CountUp } from "@/components/CountUp";
import { EmptyState } from "@/components/EmptyState";
import { StaggerList, StaggerItem } from "@/components/StaggerList";
import { playerName } from "@/lib/format";

export default async function MvpPage() {
  const data = await getMvpStandings();

  if (data.length === 0) {
    return <EmptyState>Nessun MVP assegnato ancora.</EmptyState>;
  }

  return (
    <StaggerList className="flex flex-col gap-2">
      {data.map((p, i) => (
        <StaggerItem key={p.player_id}>
          <Link
            href={`/giocatori/${p.player_id}`}
            className="tap flex items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:border-line-strong transition-colors"
          >
            <RankBadge rank={i + 1} />
            <PlayerAvatar player={p} size={36} rank={i + 1} />
            <span className="flex-1 font-medium">{playerName(p)}</span>
            <span className="font-display font-bold text-accent tabular-nums">
              <CountUp value={p.mvp_count} /> MVP
            </span>
          </Link>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
