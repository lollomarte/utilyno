"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { RankBadge } from "@/components/RankBadge";
import { RankArrow } from "@/components/RankArrow";
import { CountUp } from "@/components/CountUp";
import { ProgressBar } from "@/components/ProgressBar";
import { RuoloFilter, type RuoloFilterValue } from "@/components/RuoloFilter";
import { YearFilter, type YearFilterValue } from "@/components/YearFilter";
import { playerName } from "@/lib/format";
import type { PlayerCareerStats } from "@/lib/types";
import type { WithRankDelta } from "@/lib/data/stats";
import { computeScorersByYear, type ScorerDisplayRow, type YearTaggedParticipant } from "@/lib/yearStats";

type SortKey = "gol_totali" | "presenze" | "media_gol";

const columns: { key: SortKey; label: string; short: string }[] = [
  { key: "gol_totali", label: "Gol totali", short: "Gol" },
  { key: "presenze", label: "Presenze", short: "Pres." },
  { key: "media_gol", label: "Media gol/partita", short: "Media" },
];

export function ScorersTable({
  data,
  yearRows,
  years,
}: {
  data: (PlayerCareerStats & WithRankDelta)[];
  yearRows: YearTaggedParticipant[];
  years: string[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("gol_totali");
  const [asc, setAsc] = useState(false);
  const [ruolo, setRuolo] = useState<RuoloFilterValue>("");
  const [anno, setAnno] = useState<YearFilterValue>("");

  const baseData: ScorerDisplayRow[] = anno ? computeScorersByYear(yearRows, anno) : data;
  const filtered = ruolo ? baseData.filter((d) => d.ruolo === ruolo) : baseData;
  const sorted = [...filtered].sort((a, b) => (asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));
  const showRankInfo = sortKey === "gol_totali" && !asc && !ruolo && !anno;
  const maxGol = Math.max(1, ...filtered.map((d) => d.gol_totali));

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
        <YearFilter years={years} value={anno} onChange={setAnno} />
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
                  <div className="flex items-center gap-1">
                    <RankBadge rank={i + 1} />
                  </div>
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
                  {showRankInfo && <RankArrow delta={p.isNew ? null : p.rankDelta} />}
                  {showRankInfo && p.isNew && (
                    <span className="text-[10px] font-semibold text-accent bg-accent-dim px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </Link>
              </td>
              <td className="py-2 px-2 text-right font-display font-semibold relative">
                <ProgressBar ratio={p.gol_totali / maxGol} />
                <span className="relative tabular-nums">
                  <CountUp value={p.gol_totali} />
                </span>
              </td>
              <td className="py-2 px-2 text-right tabular-nums">{p.presenze}</td>
              <td className="py-2 px-2 text-right tabular-nums">{p.media_gol}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
