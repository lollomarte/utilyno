export interface StatComparison {
  label: string;
  valueA: number;
  valueB: number;
  format?: (v: number) => string;
  higherIsBetter?: boolean;
  /** Voce puramente informativa (es. pareggi): mai evidenziata né conteggiata nel verdetto. */
  neutral?: boolean;
}

export type ComparisonWinner = "a" | "b" | "tie";

export function compareValues({ valueA, valueB, higherIsBetter = true, neutral }: StatComparison): ComparisonWinner {
  if (neutral || valueA === valueB) return "tie";
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  return aWins ? "a" : "b";
}

export function ComparisonRow({ stat }: { stat: StatComparison }) {
  const { label, valueA, valueB, format } = stat;
  const fmt = format ?? ((v: number) => String(v));
  const winner = compareValues(stat);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-2.5 border-b border-line last:border-0">
      <span
        className={`text-right font-display font-bold tabular-nums text-base sm:text-lg ${winner === "a" ? "text-accent" : "text-ink"}`}
      >
        {fmt(valueA)}
      </span>
      <span className="text-xs sm:text-xs uppercase tracking-wide text-muted text-center px-1 sm:px-2 whitespace-nowrap">
        {label}
      </span>
      <span
        className={`text-left font-display font-bold tabular-nums text-base sm:text-lg ${winner === "b" ? "text-accent" : "text-ink"}`}
      >
        {fmt(valueB)}
      </span>
    </div>
  );
}
