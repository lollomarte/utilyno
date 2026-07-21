import type { PlayerBadges } from "@/lib/data/badges";

const definitions: { key: keyof PlayerBadges; icon: string; label: string }[] = [
  { key: "hatTrick", icon: "🎩", label: "Hat-trick" },
  { key: "everPresent", icon: "🛡️", label: "Ever-present" },
  { key: "decano", icon: "🧓", label: "Decano" },
];

export function PlayerBadgeList({ badges }: { badges: PlayerBadges }) {
  const active = definitions.filter((d) => badges[d.key]);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {active.map((b) => (
        <span
          key={b.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 px-3 py-1 text-xs font-medium"
          title={b.label}
        >
          <span>{b.icon}</span>
          {b.label}
        </span>
      ))}
    </div>
  );
}
