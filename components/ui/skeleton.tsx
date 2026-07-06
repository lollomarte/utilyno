import { cn } from "@/lib/utils";

/**
 * Placeholder di caricamento: le pagine si "materializzano" invece di
 * mostrare uno spinner. Usare al posto di qualunque indicatore di
 * caricamento generico nelle pagine con fetch lato client.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-control bg-surface-sunken motion-reduce:animate-none", className)} aria-hidden="true" />;
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 && lines > 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-card border border-border bg-surface p-6 shadow-card", className)}>
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
