import { getAttendanceStanding, getAttendanceStandingWithDelta, getSeasonsList } from "@/lib/data/stats";
import { SeasonFilter } from "@/components/SeasonFilter";
import { EmptyState } from "@/components/EmptyState";
import { AttendanceTable } from "@/components/AttendanceTable";

export default async function PresenzePage({
  searchParams,
}: {
  searchParams: Promise<{ stagione?: string }>;
}) {
  const { stagione } = await searchParams;

  const [{ totalMatches, standing: filteredStanding }, withDelta, seasons] = await Promise.all([
    getAttendanceStanding(stagione),
    getAttendanceStandingWithDelta(),
    getSeasonsList(),
  ]);

  const deltaByPlayer = new Map(withDelta.map((w) => [w.player.id, w]));
  const standing = filteredStanding.map((row) => ({
    ...row,
    rankDelta: !stagione ? deltaByPlayer.get(row.player.id)?.rankDelta ?? null : null,
    isNew: !stagione ? deltaByPlayer.get(row.player.id)?.isNew ?? false : false,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted">
          {totalMatches} partite disputate{stagione ? ` nella stagione ${stagione}` : ""}
        </p>
        <SeasonFilter seasons={seasons} />
      </div>

      {standing.length === 0 ? (
        <EmptyState>Nessuna presenza registrata.</EmptyState>
      ) : (
        <AttendanceTable standing={standing} showRankInfo={!stagione} />
      )}
    </div>
  );
}
