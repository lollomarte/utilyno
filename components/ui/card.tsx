import { cn } from "@/lib/utils";

export function Card({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cn("animate-fade-in-up rounded-card border border-border bg-surface p-6 shadow-card", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
    </div>
  );
}

export function DescriptionList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{item.label}</dt>
          <dd className="mt-1 text-sm text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
