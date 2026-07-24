export function EmptyState({
  children,
  icon = "⚽",
}: {
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="border border-dashed border-line rounded-2xl p-8 flex flex-col items-center gap-3 text-center bg-surface/50">
      <span className="text-4xl opacity-70" aria-hidden>
        {icon}
      </span>
      <p className="text-sm text-muted max-w-xs">{children}</p>
    </div>
  );
}
