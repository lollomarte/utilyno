import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { playerName, formatMarketValue } from "@/lib/format";
import type { MarketValue } from "@/lib/data/market";

export function FormationRow({
  label,
  players,
  slots,
}: {
  label: string;
  players: MarketValue[];
  slots: number;
}) {
  const items = Array.from({ length: slots }, (_, i) => players[i] ?? null);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-[11px] uppercase tracking-widest text-muted font-semibold">{label}</p>
      <div className="flex items-start justify-center gap-4 sm:gap-10 flex-wrap">
        {items.map((item, i) =>
          item ? (
            <Link
              key={item.player.id}
              href={`/giocatori/${item.player.id}`}
              className="tap flex flex-col items-center gap-2 w-20 sm:w-24"
            >
              <PlayerAvatar player={item.player} size={64} />
              <span className={`text-xs font-medium text-center truncate w-full ${item.player.attivo ? "" : "text-muted"}`}>
                {playerName(item.player)}
              </span>
              <span className="font-display text-sm font-bold text-accent tabular-nums">
                {formatMarketValue(item.valore)}
              </span>
            </Link>
          ) : (
            <div key={`empty-${i}`} className="flex flex-col items-center gap-2 w-20 sm:w-24 opacity-40">
              <div
                className="rounded-full border border-dashed border-line-strong flex items-center justify-center"
                style={{ width: 64, height: 64 }}
              >
                <span className="text-muted text-xs">?</span>
              </div>
              <span className="text-xs text-muted text-center">Slot libero</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
