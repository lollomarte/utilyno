import Link from "next/link";
import { getRecordGoliPartita, getStrisciaPresenzeRecord } from "@/lib/data/records";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { EmptyState } from "@/components/EmptyState";
import { playerName, formatDateShort } from "@/lib/format";

export default async function RecordPage() {
  const [goli, striscia] = await Promise.all([
    getRecordGoliPartita(),
    getStrisciaPresenzeRecord(),
  ]);

  if (!goli && !striscia) {
    return <EmptyState>Nessun record disponibile ancora.</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-4">
      {goli && (
        <div className="rounded-2xl border border-line p-5">
          <p className="text-sm text-muted mb-3">Più gol in una partita</p>
          <Link href={`/giocatori/${goli.player.id}`} className="flex items-center gap-3">
            <PlayerAvatar player={goli.player} size={44} />
            <div className="flex-1">
              <p className="font-semibold">{playerName(goli.player)}</p>
              <p className="text-sm text-muted">{formatDateShort(goli.data)}</p>
            </div>
            <p className="text-2xl font-bold tabular-nums">{goli.gol}</p>
          </Link>
        </div>
      )}

      {striscia && (
        <div className="rounded-2xl border border-line p-5">
          <p className="text-sm text-muted mb-3">Striscia di presenze più lunga</p>
          <Link href={`/giocatori/${striscia.player.id}`} className="flex items-center gap-3">
            <PlayerAvatar player={striscia.player} size={44} />
            <div className="flex-1">
              <p className="font-semibold">{playerName(striscia.player)}</p>
              <p className="text-sm text-muted">partite consecutive</p>
            </div>
            <p className="text-2xl font-bold tabular-nums">{striscia.streak}</p>
          </Link>
        </div>
      )}
    </div>
  );
}
