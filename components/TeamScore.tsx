import { Jersey } from "@/components/Jersey";

const sizeStyles = {
  sm: { wrap: "gap-1.5", num: "text-xl", label: "text-xs", dash: "text-base", jersey: 14 },
  lg: { wrap: "gap-2 sm:gap-3", num: "text-hero", label: "text-xs sm:text-sm", dash: "text-4xl", jersey: 20 },
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
      <span className={`flex items-center gap-1 font-medium uppercase tracking-wide text-muted ${s.label}`}>
        <Jersey squadra="bianca" size={s.jersey} />
        Bianchi
      </span>
      <span className={`${s.num} ${winner === "nera" ? "text-faint" : "text-ink"}`}>{golBianca}</span>
      <span className={`text-muted ${s.dash}`}>–</span>
      <span className={`${s.num} ${winner === "bianca" ? "text-faint" : "text-ink"}`}>{golNera}</span>
      <span className={`flex items-center gap-1 font-medium uppercase tracking-wide text-muted ${s.label}`}>
        Neri
        <Jersey squadra="nera" size={s.jersey} />
      </span>
    </div>
  );
}
