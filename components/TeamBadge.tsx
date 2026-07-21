import type { Squadra } from "@/lib/types";

export function TeamBadge({ squadra }: { squadra: Squadra }) {
  const isBianca = squadra === "bianca";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isBianca
          ? "bg-bianca-dim text-bianca border-line-strong shadow-[0_0_10px_var(--color-bianca-dim)]"
          : "bg-nera text-ink border-nera-line"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isBianca ? "bg-bianca" : "bg-nera-line"}`} />
      {isBianca ? "Bianca" : "Nera"}
    </span>
  );
}
