export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-line rounded-xl p-8 text-center text-muted text-sm bg-surface/50">
      {children}
    </div>
  );
}
