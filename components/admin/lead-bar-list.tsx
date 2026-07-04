export function LeadBarList({ items }: { items: { label: string; count: number }[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">Nessun lead generato ancora.</p>;
  }

  const max = Math.max(...items.map((i) => i.count));

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-slate-700">{item.label}</span>
            <span className="font-medium text-slate-900">{item.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
