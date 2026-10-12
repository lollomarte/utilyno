export function GoleadaChip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold text-hot bg-hot-dim border border-hot/30 rounded-full px-2 py-0.5 ${className}`}
    >
      🔥 goleada
    </span>
  );
}
