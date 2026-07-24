"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { CountUp } from "@/components/CountUp";
import { playerName } from "@/lib/format";

interface HolderLite {
  id: string;
  nome: string;
  cognome: string;
  foto_url: string | null;
}

export interface RecordRow {
  /** Uno per un record individuale, due per un record "in coppia", di più per un ex-aequo a più giocatori. */
  holders?: HolderLite[];
  href?: string;
  label?: string;
}

export function RecordCard({
  icon,
  title,
  value,
  suffix = "",
  decimals = 0,
  accent = true,
  rows,
  note,
}: {
  icon: string;
  title: string;
  value: number;
  suffix?: string;
  decimals?: number;
  accent?: boolean;
  rows?: RecordRow[];
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted flex items-center gap-1.5">
          <span aria-hidden>{icon}</span>
          {title}
        </p>
        <p
          className={`font-display text-3xl font-bold tabular-nums shrink-0 leading-none ${accent ? "text-accent" : ""}`}
        >
          <CountUp value={value} decimals={decimals} />
          {suffix}
        </p>
      </div>

      {rows && rows.length > 0 && (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <RecordRowLine key={i} row={row} />
          ))}
        </div>
      )}

      {note && <p className="text-xs text-muted mt-auto pt-1">{note}</p>}
    </div>
  );
}

function RecordRowLine({ row }: { row: RecordRow }) {
  const [expanded, setExpanded] = useState(false);
  const holders = row.holders ?? [];
  const overflowing = holders.length > 2;
  const visible = expanded || !overflowing ? holders : holders.slice(0, 2);
  const extra = holders.length - visible.length;

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 min-w-0">
        {visible.map((h, j) => (
          <span key={h.id} className="flex items-center gap-1.5">
            {j > 0 && <span className="text-muted text-xs shrink-0">e</span>}
            <Link href={`/giocatori/${h.id}`} className="tap flex items-center gap-1.5 hover:underline">
              <PlayerAvatar player={h} size={24} />
              <span className="text-sm font-medium">{playerName(h)}</span>
            </Link>
          </span>
        ))}

        {extra > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="tap text-xs font-semibold text-accent bg-accent-dim rounded-full px-2 py-1"
          >
            +{extra} altri
          </button>
        )}

        {row.label &&
          (row.href ? (
            <Link
              href={row.href}
              className="tap text-xs text-muted hover:text-ink ml-auto shrink-0 whitespace-nowrap"
            >
              {row.label} →
            </Link>
          ) : (
            <span className="text-xs text-muted ml-auto shrink-0 whitespace-nowrap">{row.label}</span>
          ))}
      </div>
    </div>
  );
}
