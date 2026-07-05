import { LoqoSeal } from "@/components/brand/loqo-seal";
import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="animate-fade-in-up overflow-x-auto rounded-card border border-slate-200 bg-surface shadow-card">
      <table className={cn("min-w-full divide-y divide-slate-200 text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-surface-muted">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>;
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("hover:bg-surface-muted", className)}>{children}</tr>;
}

export function TableHeaderCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500", className)}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("whitespace-nowrap px-4 py-3 text-slate-700", className)}>{children}</td>;
}

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up flex flex-col items-center gap-3 px-4 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken" aria-hidden="true">
        <LoqoSeal size={26} color="#8a9599" ring={false} />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
      {action}
    </div>
  );
}
