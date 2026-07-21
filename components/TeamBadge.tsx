import type { Squadra } from "@/lib/types";

export function TeamBadge({ squadra }: { squadra: Squadra }) {
  const isBianca = squadra === "bianca";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isBianca ? "bg-bianca text-ink border-line" : "bg-nera text-paper border-nera"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${isBianca ? "bg-ink border border-ink" : "bg-paper"}`}
      />
      {isBianca ? "Bianca" : "Nera"}
    </span>
  );
}
