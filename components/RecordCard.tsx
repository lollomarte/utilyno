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
  /** Uno per un record individuale, due per un record "in coppia". */
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
        <div className="flex flex-col gap-1.5">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              {row.holders?.map((h, j) => (
                <span key={h.id} className="flex items-center gap-1.5 min-w-0">
                  {j > 0 && <span className="text-muted text-xs shrink-0">e</span>}
                  <Link
                    href={`/giocatori/${h.id}`}
                    className="tap flex items-center gap-1.5 hover:underline min-w-0"
                  >
                    <PlayerAvatar player={h} size={24} />
                    <span className="text-sm font-medium truncate">{playerName(h)}</span>
                  </Link>
                </span>
              ))}
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
          ))}
        </div>
      )}

      {note && <p className="text-xs text-muted mt-auto pt-1">{note}</p>}
    </div>
  );
}
