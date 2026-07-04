import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatTrend {
  value: string;
  direction: "up" | "down";
  /** Se la direzione "up" è un fatto negativo (es. pagamenti in ritardo in aumento), inverte i colori. */
  positive?: boolean;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning" | "danger";
  icon?: LucideIcon;
  trend?: StatTrend;
}) {
  const trendIsGood = trend ? (trend.positive ?? trend.direction === "up") : false;
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-card border border-slate-200 bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
          </div>
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight",
          tone === "warning" && "text-amber-600",
          tone === "danger" && "text-red-600",
          tone === "default" && "text-slate-900"
        )}
      >
        {value}
      </p>
      {(hint || trend) && (
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                trendIsGood ? "text-accent" : "text-red-600"
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {trend.value}
            </span>
          )}
          {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
      )}
    </div>
  );
}
