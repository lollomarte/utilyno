import Link from "next/link";
import { PaniniSticker } from "@/components/PaniniSticker";
import { formatMarketValue, marketTier } from "@/lib/format";
import type { MarketPlayerRow } from "@/lib/data/market";

// Soglia della fascia "Pallone d'Oro" (vedi marketTier): sopra questo valore
// la figurina diventa quella speciale dorata.
const FOIL_THRESHOLD = 100;

/** Casella d'album del mercato: la figurina del giocatore con sotto
 * quotazione, andamento e fascia di mercato. */
export function MarketCard({ row, rank }: { row: MarketPlayerRow; rank?: number }) {
  const tier = marketTier(row.valore, row.player.is_clown);
  const trendUp = row.trend !== null && row.trend > 0;
  const trendDown = row.trend !== null && row.trend < 0;

  return (
    <Link href={`/giocatori/${row.player.id}`} className="tap group flex flex-col items-center gap-2 min-w-0">
      <PaniniSticker
        player={row.player}
        number={rank}
        foil={!row.player.is_clown && row.valore >= FOIL_THRESHOLD}
        className="w-full transition-transform duration-200 group-hover:-rotate-1 group-hover:-translate-y-0.5"
        sizes="(max-width: 640px) 45vw, 200px"
      />

      <div className="flex w-full items-baseline justify-between gap-2 px-0.5">
        <p className="font-display text-xl font-bold tabular-nums">{formatMarketValue(row.valore)}</p>
        {row.trend !== null ? (
          <p
            className={`text-xs font-semibold flex items-center gap-0.5 shrink-0 ${
              trendUp ? "text-win" : trendDown ? "text-loss" : "text-muted"
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

      <span
        className={`max-w-full text-center text-xs font-semibold px-2 py-0.5 rounded-full border leading-tight ${tier.className}`}
      >
        {tier.label}
      </span>
    </Link>
  );
}
