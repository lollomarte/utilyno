import type { Squadra } from "@/lib/types";

/** Maglietta stilizzata della squadra (bianca o nera), con il filo
 * d'inchiostro dell'album per restare visibile su qualsiasi fondo. */
export function Jersey({ squadra, size = 16 }: { squadra: Squadra; size?: number }) {
  const isBianca = squadra === "bianca";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path
        d="M8 2.5 3 5.2 1.5 10l3.3 1.4L6 9.8V21.5h12V9.8l1.2 1.6 3.3-1.4L21 5.2l-5-2.7c-.6 1.6-2.2 2.6-4 2.6s-3.4-1-4-2.6Z"
        fill={isBianca ? "var(--color-bianca)" : "var(--color-nera-line)"}
        stroke={isBianca ? "var(--color-nera-line)" : "var(--color-bianca)"}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}
