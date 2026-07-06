import { LoqoSeal } from "@/components/brand/loqo-seal";
import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
      <table className={cn("min-w-full divide-y divide-border text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-surface-muted">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="stagger-rows divide-y divide-border/60 bg-surface">{children}</tbody>;
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("transition-colors duration-[var(--duration-micro)] ease-[var(--ease-loqo)] hover:bg-surface-muted", className)}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted", className)}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("whitespace-nowrap px-4 py-3 text-ink", className)}>{children}</td>;
}

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up flex flex-col items-center gap-3 px-4 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken" aria-hidden="true">
        <LoqoSeal size={26} color="var(--color-ink-subtle)" ring={false} />
      </div>
      <p className="text-sm text-ink-subtle">{message}</p>
      {action}
    </div>
  );
}
