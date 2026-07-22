export function GoleadaChip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full px-2 py-0.5 ${className}`}
    >
      🔥 goleada
    </span>
  );
}
