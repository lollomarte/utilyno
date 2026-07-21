export function RankArrow({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return <span className="text-muted text-xs w-5 text-center">–</span>;
  }
  if (delta > 0) {
    return (
      <span className="text-accent text-xs font-semibold w-5 text-center flex items-center justify-center gap-0.5">
        ▲{delta > 1 ? delta : ""}
      </span>
    );
  }
  return (
    <span className="text-red-400 text-xs font-semibold w-5 text-center flex items-center justify-center gap-0.5">
      ▼{-delta > 1 ? -delta : ""}
    </span>
  );
}
