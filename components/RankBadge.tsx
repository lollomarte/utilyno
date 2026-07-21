const styles: Record<number, string> = {
  1: "bg-gold/15 text-gold border-gold/40",
  2: "bg-silver/15 text-silver border-silver/40",
  3: "bg-bronze/15 text-bronze border-bronze/40",
};

const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) {
    return <span className="w-6 text-center text-muted text-sm font-medium">{rank}</span>;
  }
  return (
    <span
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border shrink-0 ${styles[rank]}`}
    >
      {medals[rank]}
    </span>
  );
}
