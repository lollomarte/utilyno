export function RankArrow({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return <span className="text-muted text-xs w-5 text-center">–</span>;
  }
  if (delta > 0) {
    return (
      <span className="text-win text-xs font-semibold w-5 text-center flex items-center justify-center gap-0.5">
        ▲{delta > 1 ? delta : ""}
      </span>
    );
  }
  return (
    <span className="text-loss text-xs font-semibold w-5 text-center flex items-center justify-center gap-0.5">
      ▼{-delta > 1 ? -delta : ""}
    </span>
  );
}
