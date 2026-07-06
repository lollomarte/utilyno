"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Su mobile scorre dall'alto verso il basso come una bottom sheet (angoli
 * arrotondati solo in alto, ancorata al fondo); su desktop resta un dialogo
 * centrato classico. Nessun cambiamento richiesto ai punti di utilizzo.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }
    setEntered(false);
    const timer = setTimeout(() => setRendered(false), 300);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!rendered) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center bg-primary/50 transition-opacity duration-[var(--duration-transition)] ease-[var(--ease-loqo)] md:items-center md:px-4",
        entered ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-t-sheet bg-surface p-6 shadow-sheet transition-transform duration-[var(--duration-transition)] ease-[var(--ease-loqo)] md:max-w-lg md:rounded-sheet",
          entered ? "translate-y-0" : "translate-y-full md:translate-y-4"
        )}
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-border md:hidden" aria-hidden="true" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex items-center justify-center text-ink-subtle hover:text-ink"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
