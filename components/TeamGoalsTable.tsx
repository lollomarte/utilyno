"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { RankBadge } from "@/components/RankBadge";
import { CountUp } from "@/components/CountUp";
import { ProgressBar } from "@/components/ProgressBar";
import { RuoloFilter, type RuoloFilterValue } from "@/components/RuoloFilter";
import { playerName } from "@/lib/format";
import type { TeamGoalsRow } from "@/lib/data/stats";

type SortKey = "gol_fatti" | "gol_subiti" | "differenza_reti";

const columns: { key: SortKey; label: string; short: string }[] = [
  { key: "gol_fatti", label: "Gol fatti squadra", short: "Fatti" },
  { key: "gol_subiti", label: "Gol subiti squadra", short: "Subiti" },
  { key: "differenza_reti", label: "Differenza reti", short: "Diff." },
];

export function TeamGoalsTable({ data }: { data: TeamGoalsRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("differenza_reti");
  const [asc, setAsc] = useState(false);
  const [ruolo, setRuolo] = useState<RuoloFilterValue>("");

  const filtered = ruolo ? data.filter((d) => d.ruolo === ruolo) : data;
  const sorted = [...filtered].sort((a, b) => (asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));
  const showRankInfo = sortKey === "differenza_reti" && !asc && !ruolo;
  const maxGolFatti = Math.max(1, ...filtered.map((d) => d.gol_fatti));

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc(!asc);
    } else {
      setSortKey(key);
      setAsc(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <RuoloFilter value={ruolo} onChange={setRuolo} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-muted text-left border-b border-line">
              <th className="py-2 pr-2 font-medium w-8"></th>
              <th className="py-2 pr-2 font-medium">Giocatore</th>
              {columns.map((col) => (
                <th key={col.key} className="py-2 px-2 font-medium text-right">
                  <button
                    onClick={() => toggleSort(col.key)}
                    className={`tap inline-flex items-center gap-1 hover:text-ink ${
                      sortKey === col.key ? "text-ink font-semibold" : ""
                    }`}
                  >
                    <span className="hidden sm:inline">{col.label}</span>
                    <span className="sm:hidden">{col.short}</span>
                    {sortKey === col.key && <span>{asc ? "↑" : "↓"}</span>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <motion.tr
                key={p.player_id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.03, duration: 0.3 }}
                className="border-b border-line last:border-0"
              >
                <td className="py-2 pr-1">
                  {showRankInfo ? (
                    <RankBadge rank={i + 1} />
                  ) : (
                    <span className="w-6 text-center text-muted text-sm inline-block">{i + 1}</span>
                  )}
                </td>
                <td className="py-2 pr-2">
                  <Link
                    href={`/giocatori/${p.player_id}`}
                    className="tap flex items-center gap-2 font-medium hover:underline"
                  >
                    <PlayerAvatar player={p} size={28} rank={showRankInfo ? i + 1 : undefined} />
                    <span className={p.attivo ? "" : "text-muted"}>{playerName(p)}</span>
                  </Link>
                </td>
                <td className="py-2 px-2 text-right font-display font-semibold relative">
                  <ProgressBar ratio={p.gol_fatti / maxGolFatti} />
                  <span className="relative tabular-nums">
                    <CountUp value={p.gol_fatti} />
                  </span>
                </td>
                <td className="py-2 px-2 text-right tabular-nums">{p.gol_subiti}</td>
                <td className="py-2 px-2 text-right tabular-nums">
                  {p.differenza_reti > 0 ? `+${p.differenza_reti}` : p.differenza_reti}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
