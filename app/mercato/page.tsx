import { getMarketPageData } from "@/lib/data/market";
import { MarketList } from "@/components/MarketList";
import { MarketMovers } from "@/components/MarketMovers";
import { Sparkline } from "@/components/Sparkline";
import { EmptyState } from "@/components/EmptyState";
import { formatMarketValue } from "@/lib/format";

export default async function MercatoPage() {
  const { players, topRisers, topFallers, groupTrend, hasHistory } = await getMarketPageData();

  if (players.length === 0) {
    return <EmptyState>Nessun giocatore registrato ancora.</EmptyState>;
  }

  const marketCap = players.reduce((sum, p) => sum + p.valore, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Mercato</h1>
        <p className="text-sm text-muted">
          Quotazioni simulate in stile Transfermarkt, calcolate dalle statistiche del gruppo.
        </p>
      </div>

      <div className="rounded-2xl border border-line-strong bg-surface p-5">
        <p className="text-xs uppercase tracking-widest text-muted font-semibold">
          Valore complessivo del gruppo
        </p>
        <p className="font-display text-3xl font-bold tabular-nums mt-1">{formatMarketValue(marketCap)}</p>
        {groupTrend.length >= 2 && (
          <div className="mt-3">
            <Sparkline values={groupTrend} width={520} height={56} gradientId="market-group-trend" />
          </div>
        )}
        {!hasHistory && (
          <p className="text-xs text-muted mt-3">
            Lo storico dei valori si accumula mese dopo mese: al momento è disponibile solo la
            quotazione attuale, i trend compariranno dal prossimo mese.
          </p>
        )}
      </div>

      {hasHistory && <MarketMovers risers={topRisers} fallers={topFallers} />}

      <MarketList players={players} />
    </div>
  );
}
