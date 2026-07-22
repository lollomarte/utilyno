const sizeStyles = {
  sm: { wrap: "gap-1.5", num: "text-xl", label: "text-[10px]", dash: "text-base" },
  lg: { wrap: "gap-2 sm:gap-3", num: "text-5xl sm:text-6xl", label: "text-xs sm:text-sm", dash: "text-3xl sm:text-4xl" },
} as const;

export function TeamScore({
  golBianca,
  golNera,
  size = "lg",
}: {
  golBianca: number;
  golNera: number;
  size?: "sm" | "lg";
}) {
  const s = sizeStyles[size];
  const winner = golBianca === golNera ? null : golBianca > golNera ? "bianca" : "nera";

  return (
    <div className={`flex items-center justify-center font-display font-bold tabular-nums ${s.wrap}`}>
      <span className={`flex items-center gap-1 font-normal tracking-wide text-muted ${s.label}`}>
        <span className="w-2 h-2 rounded-full bg-bianca border border-line-strong shrink-0" />
        Bianchi
      </span>
      <span className={`${s.num} ${winner === "nera" ? "text-muted" : "text-ink"}`}>{golBianca}</span>
      <span className={`text-muted ${s.dash}`}>–</span>
      <span className={`${s.num} ${winner === "bianca" ? "text-muted" : "text-ink"}`}>{golNera}</span>
      <span className={`flex items-center gap-1 font-normal tracking-wide text-muted ${s.label}`}>
        Neri
        <span className="w-2 h-2 rounded-full bg-nera-line shrink-0" />
      </span>
    </div>
  );
}
