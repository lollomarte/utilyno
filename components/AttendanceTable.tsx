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
import type { AttendanceRow } from "@/lib/data/stats";
import { computeAttendanceByYear, type AttendanceDisplayRow, type YearTaggedParticipant } from "@/lib/yearStats";

interface Row extends AttendanceRow {
  rankDelta: number | null;
  isNew: boolean;
}

export function AttendanceTable({
  standing,
  showRankInfo,
  yearRows,
  years,
  yearMatchCounts,
}: {
  standing: Row[];
  showRankInfo: boolean;
  yearRows: YearTaggedParticipant[];
  years: string[];
  yearMatchCounts: Record<string, number>;
}) {
  const [ruolo, setRuolo] = useState<RuoloFilterValue>("");
  const [anno, setAnno] = useState<YearFilterValue>("");

  const baseData: (Row | AttendanceDisplayRow)[] = anno
    ? computeAttendanceByYear(yearRows, anno, yearMatchCounts[anno] ?? 0)
    : standing;
  const filtered = ruolo ? baseData.filter((r) => r.player.ruolo === ruolo) : baseData;
  const maxPresenze = Math.max(1, ...filtered.map((r) => r.presenze));
  const showRank = showRankInfo && !ruolo && !anno;

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
              <th className="py-2 pr-1 font-medium w-8"></th>
              <th className="py-2 pr-2 font-medium">Giocatore</th>
              <th className="py-2 px-2 font-medium text-right">Presenze</th>
              <th className="py-2 px-2 font-medium text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <motion.tr
                key={row.player.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.03, duration: 0.3 }}
                className="border-b border-line last:border-0"
              >
                <td className="py-2 pr-1">
                  {showRank ? (
                    <RankBadge rank={i + 1} />
                  ) : (
                    <span className="w-6 text-center text-muted text-sm inline-block">{i + 1}</span>
                  )}
                </td>
                <td className="py-2 pr-2">
                  <Link
                    href={`/giocatori/${row.player.id}`}
                    className="tap flex items-center gap-2 font-medium hover:underline"
                  >
                    <PlayerAvatar player={row.player} size={28} rank={showRank ? i + 1 : undefined} />
                    <span className={row.player.attivo ? "" : "text-muted"}>{playerName(row.player)}</span>
                    {showRank && <RankArrow delta={row.isNew ? null : row.rankDelta} />}
                    {showRank && row.isNew && (
                      <span className="text-[10px] font-semibold text-accent bg-accent-dim px-1.5 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-2 px-2 text-right font-display font-semibold relative">
                  <ProgressBar ratio={row.presenze / maxPresenze} />
                  <span className="relative tabular-nums">
                    <CountUp value={row.presenze} />
                  </span>
                </td>
                <td className="py-2 px-2 text-right tabular-nums">{row.percentuale}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
