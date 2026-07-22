"use client";

import { useMemo, useState } from "react";
import { MarketCard } from "@/components/MarketCard";
import { RuoloFilter, type RuoloFilterValue } from "@/components/RuoloFilter";
import { playerName } from "@/lib/format";
import type { MarketPlayerRow } from "@/lib/data/market";

type SortKey = "valore" | "trend" | "nome";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "valore", label: "Valore" },
  { key: "trend", label: "Trend" },
  { key: "nome", label: "Nome" },
];

export function MarketList({ players }: { players: MarketPlayerRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("valore");
  const [ruolo, setRuolo] = useState<RuoloFilterValue>("");

  const filtered = ruolo ? players.filter((p) => p.player.ruolo === ruolo) : players;

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === "valore") return b.valore - a.valore;
      if (sortKey === "trend") return (b.trend ?? -Infinity) - (a.trend ?? -Infinity);
      return playerName(a.player).localeCompare(playerName(b.player));
    });
  }, [filtered, sortKey]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RuoloFilter value={ruolo} onChange={setRuolo} />
        <div className="flex gap-1 rounded-full border border-line p-1">
          {sortOptions.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setSortKey(o.key)}
              className={`tap px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                sortKey === o.key ? "bg-accent text-[#06210f]" : "text-muted hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((row) => (
          <MarketCard key={row.player.id} row={row} />
        ))}
      </div>
    </div>
  );
}
