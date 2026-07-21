"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Raggruppa campi opzionali "da compilare quando disponibili" senza appesantire la vista
 * iniziale di un form già lungo (es. dati catastali, APE, dotazioni...). Chiuso di default:
 * chi non ha questi dati sottomano non deve nemmeno scorrerli.
 */
export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-control border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-sm font-medium text-ink">{title}</span>
          {description && <span className="mt-0.5 block text-xs text-ink-subtle">{description}</span>}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-ink-subtle transition-transform duration-[var(--duration-micro)]", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && <div className="space-y-4 border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}
