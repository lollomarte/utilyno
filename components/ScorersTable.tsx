"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { playerName } from "@/lib/format";
import type { PlayerCareerStats } from "@/lib/types";

type SortKey = "gol_totali" | "presenze" | "media_gol";

const columns: { key: SortKey; label: string; short: string }[] = [
  { key: "gol_totali", label: "Gol totali", short: "Gol" },
  { key: "presenze", label: "Presenze", short: "Pres." },
  { key: "media_gol", label: "Media gol/partita", short: "Media" },
];

export function ScorersTable({ data }: { data: PlayerCareerStats[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("gol_totali");
  const [asc, setAsc] = useState(false);

  const sorted = [...data].sort((a, b) => (asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc(!asc);
    } else {
      setSortKey(key);
      setAsc(false);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-muted text-left border-b border-line">
            <th className="py-2 pr-2 font-medium">#</th>
            <th className="py-2 pr-2 font-medium">Giocatore</th>
            {columns.map((col) => (
              <th key={col.key} className="py-2 px-2 font-medium text-right">
                <button
                  onClick={() => toggleSort(col.key)}
                  className={`inline-flex items-center gap-1 hover:text-ink ${
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
            <tr key={p.player_id} className="border-b border-line last:border-0">
              <td className="py-2 pr-2 text-muted">{i + 1}</td>
              <td className="py-2 pr-2">
                <Link
                  href={`/giocatori/${p.player_id}`}
                  className="flex items-center gap-2 font-medium hover:underline"
                >
                  <PlayerAvatar player={p} size={28} />
                  <span className={p.attivo ? "" : "text-muted"}>{playerName(p)}</span>
                </Link>
              </td>
              <td className="py-2 px-2 text-right tabular-nums font-semibold">{p.gol_totali}</td>
              <td className="py-2 px-2 text-right tabular-nums">{p.presenze}</td>
              <td className="py-2 px-2 text-right tabular-nums">{p.media_gol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
