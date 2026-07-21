import Link from "next/link";
import { getAttendanceStanding, getSeasonsList } from "@/lib/data/stats";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { SeasonFilter } from "@/components/SeasonFilter";
import { EmptyState } from "@/components/EmptyState";
import { playerName } from "@/lib/format";

export default async function PresenzePage({
  searchParams,
}: {
  searchParams: Promise<{ stagione?: string }>;
}) {
  const { stagione } = await searchParams;
  const [{ totalMatches, standing }, seasons] = await Promise.all([
    getAttendanceStanding(stagione),
    getSeasonsList(),
  ]);

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-muted text-left border-b border-line">
                <th className="py-2 pr-2 font-medium">#</th>
                <th className="py-2 pr-2 font-medium">Giocatore</th>
                <th className="py-2 px-2 font-medium text-right">Presenze</th>
                <th className="py-2 px-2 font-medium text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {standing.map((row, i) => (
                <tr key={row.player.id} className="border-b border-line last:border-0">
                  <td className="py-2 pr-2 text-muted">{i + 1}</td>
                  <td className="py-2 pr-2">
                    <Link
                      href={`/giocatori/${row.player.id}`}
                      className="flex items-center gap-2 font-medium hover:underline"
                    >
                      <PlayerAvatar player={row.player} size={28} />
                      <span className={row.player.attivo ? "" : "text-muted"}>
                        {playerName(row.player)}
                      </span>
                    </Link>
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums font-semibold">
                    {row.presenze}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">{row.percentuale}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
