import type { Squadra } from "@/lib/types";
import { Jersey } from "@/components/Jersey";

export function TeamBadge({ squadra }: { squadra: Squadra }) {
  const isBianca = squadra === "bianca";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${
        isBianca ? "bg-bianca text-ink border-line-strong" : "bg-nera-line text-on-accent border-nera-line"
      }`}
    >
      <Jersey squadra={squadra} size={12} />
      {isBianca ? "Bianca" : "Nera"}
    </span>
  );
}
