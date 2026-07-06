import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LoqoSeal } from "@/components/brand/loqo-seal";
import { cn } from "@/lib/utils";

export interface AttentionItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  tone?: "danger" | "warning" | "info";
}

const TONE_CLASSES: Record<NonNullable<AttentionItem["tone"]>, string> = {
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

/**
 * "Cosa richiede attenzione oggi": in cima a ogni dashboard, risponde alla
 * domanda concreta prima della griglia KPI. Calcolato dai dati già
 * caricati dalla pagina (nessuna query dedicata). Porta Il Timbro: è,
 * insieme alla CTA primaria e alla nav attiva, una delle sole superfici
 * a cui la firma visiva di LOQO è applicata.
 */
export function AttentionBlock({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="timbro flex items-center gap-4 rounded-card border border-border bg-surface p-6 shadow-card">
        <LoqoSeal size={32} color="var(--color-ink-subtle)" ring={false} className="shrink-0 opacity-40" />
        <div>
          <p className="text-sm font-medium text-ink">Tutto in ordine.</p>
          <p className="text-sm text-ink-muted">Nessuna azione richiede la tua attenzione oggi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timbro rounded-card border border-border bg-surface p-5 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">Cosa richiede attenzione</p>
      <ul className="mt-3 space-y-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          const inner = (
            <>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  TONE_CLASSES[item.tone ?? "info"]
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-sm text-ink">{item.label}</span>
            </>
          );
          return (
            <li key={i}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="-mx-2 flex items-center gap-3 rounded-control px-2 py-1.5 transition-colors duration-[var(--duration-micro)] ease-[var(--ease-loqo)] hover:bg-surface-muted"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-2 py-1.5">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
