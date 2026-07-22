"use client";

import { useRouter, usePathname } from "next/navigation";
import { PlayerSearchSelect } from "@/components/PlayerSearchSelect";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { playerName } from "@/lib/format";
import type { Player } from "@/lib/types";
import type { HeadToHead } from "@/lib/data/matches";

type PlayerLite = Pick<Player, "id" | "nome" | "cognome" | "foto_url">;

export function HeadToHeadWidget({
  player,
  players,
  vsPlayer,
  h2h,
}: {
  player: PlayerLite;
  players: Player[];
  vsPlayer: PlayerLite | null;
  h2h: HeadToHead | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function onSelect(id: string) {
    router.push(id ? `${pathname}?vs=${id}` : pathname);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">Head-to-head</p>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-sm text-muted">Confronta con:</span>
        <PlayerSearchSelect
          players={players}
          value={vsPlayer?.id ?? ""}
          onChange={onSelect}
          placeholder="Cerca giocatore…"
        />
      </div>

      {vsPlayer && h2h && (
        <div className="pt-3 mt-2 border-t border-line">
          {h2h.totalMatches === 0 ? (
            <p className="text-sm text-muted text-center">
              {playerName(player)} e {playerName(vsPlayer)} non hanno mai giocato nella stessa serata.
            </p>
          ) : (
            <div className="flex items-center justify-around text-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <PlayerAvatar player={player} size={40} />
                <span className="text-xs text-muted truncate max-w-[80px]">{playerName(player)}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-2xl font-bold tabular-nums">{h2h.together}</span>
                  <span className="text-xs text-muted">insieme</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-2xl font-bold tabular-nums">{h2h.against}</span>
                  <span className="text-xs text-muted">avversari</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <PlayerAvatar player={vsPlayer} size={40} />
                <span className="text-xs text-muted truncate max-w-[80px]">{playerName(vsPlayer)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
