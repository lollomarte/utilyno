import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { TeamScore } from "@/components/TeamScore";
import { GoleadaChip } from "@/components/GoleadaChip";
import { ShareMatchButton } from "@/components/ShareMatchButton";
import { topNScorersOf } from "@/lib/data/matchHelpers";
import { formatDateShort } from "@/lib/format";
import type { MatchResultWithParticipants } from "@/lib/data/matches";

const GOLEADA_THRESHOLD = 5;

export function MatchCard({ match }: { match: MatchResultWithParticipants }) {
  const diff = Math.abs(match.gol_bianca - match.gol_nera);
  const isPareggio = match.gol_bianca === match.gol_nera;
  const topScorers = topNScorersOf(match.participants, 3);

  return (
    <div className="relative">
      <span
        className={`absolute -left-[21px] top-4 w-2 h-2 rounded-full ${isPareggio ? "bg-muted" : "bg-accent"}`}
      />
      <div className="relative rounded-xl border border-line bg-surface p-4 hover:border-line-strong transition-colors flex flex-col gap-2.5">
        <Link
          href={`/risultati/${match.match_id}`}
          className="absolute inset-0 rounded-xl"
          aria-label={`Dettaglio partita del ${formatDateShort(match.data)}`}
        />

        <div className="relative flex items-start justify-between gap-3 pointer-events-none">
          <div className="min-w-0">
            <p className="text-sm font-medium">{formatDateShort(match.data)}</p>
            {match.note && <p className="text-xs text-muted mt-0.5 truncate">{match.note}</p>}
          </div>
          {diff >= GOLEADA_THRESHOLD && <GoleadaChip className="shrink-0" />}
        </div>

        <div className="relative pointer-events-none">
          <TeamScore golBianca={match.gol_bianca} golNera={match.gol_nera} size="sm" />
        </div>

        <div className="relative flex items-center justify-between gap-2">
          <div className="flex -space-x-2 pointer-events-none">
            {topScorers.map((p) => (
              <PlayerAvatar key={p.player.id} player={p.player} size={24} />
            ))}
          </div>
          <div className="pointer-events-auto">
            <ShareMatchButton
              match={{
                data: match.data,
                gol_bianca: match.gol_bianca,
                gol_nera: match.gol_nera,
                participants: match.participants,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
