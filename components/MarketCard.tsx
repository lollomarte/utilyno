import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Sparkline } from "@/components/Sparkline";
import { playerName, formatMarketValue, marketTier, ruoloLabel } from "@/lib/format";
import type { MarketPlayerRow } from "@/lib/data/market";

const TREND_DOWN_COLOR = "#f87171"; // tailwind red-400, coerente con il resto del sito

export function MarketCard({ row }: { row: MarketPlayerRow }) {
  const tier = marketTier(row.valore);
  const trendUp = row.trend !== null && row.trend > 0;
  const trendDown = row.trend !== null && row.trend < 0;

  return (
    <Link
      href={`/giocatori/${row.player.id}`}
      className="tap flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-line-strong transition-colors"
    >
      <div className="flex items-center gap-3">
        <PlayerAvatar player={row.player} size={48} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${row.player.attivo ? "" : "text-muted"}`}>
            {playerName(row.player)}
          </p>
          {row.player.ruolo && <p className="text-xs text-muted">{ruoloLabel[row.player.ruolo]}</p>}
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full border ${tier.className}`}>
          {tier.label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-2xl font-bold tabular-nums">{formatMarketValue(row.valore)}</p>
        {row.trend !== null ? (
          <p
            className={`text-xs font-semibold flex items-center gap-1 shrink-0 ${
              trendUp ? "text-accent" : trendDown ? "text-red-400" : "text-muted"
            }`}
          >
            {trendUp && "▲"}
            {trendDown && "▼"}
            {!trendUp && !trendDown && "–"}
            {(trendUp || trendDown) && formatMarketValue(Math.abs(row.trend ?? 0))}
          </p>
        ) : (
          <p className="text-xs text-muted shrink-0">Nuovo</p>
        )}
      </div>

      {row.sparkline.length >= 2 && (
        <Sparkline
          values={row.sparkline}
          width={240}
          height={36}
          color={trendDown ? TREND_DOWN_COLOR : "var(--color-accent)"}
          gradientId={`market-spark-${row.player.id}`}
        />
      )}
    </Link>
  );
}
