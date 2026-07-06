"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "danger" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  danger: XCircle,
  info: Info,
};

const TONE_ICON_CLASSES: Record<ToastTone, string> = {
  success: "text-success",
  danger: "text-danger",
  info: "text-info",
};

let idCounter = 0;

/**
 * Sistema di notifiche in-app unificato (salvataggi, invii, errori): un
 * solo linguaggio di motion per tutta la piattaforma invece di alert()
 * o messaggi inline sparsi. Monta una volta nel layout radice.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = ++idCounter;
      setItems((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end sm:p-0">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const Icon = TONE_ICON[item.tone];

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-elevated transition-all duration-[var(--duration-transition)] ease-[var(--ease-loqo)] motion-reduce:transition-none",
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
      role="status"
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", TONE_ICON_CLASSES[item.tone])} aria-hidden="true" />
      <p className="flex-1 text-sm text-ink">{item.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-ink-subtle transition-colors duration-[var(--duration-micro)] hover:text-ink"
        aria-label="Chiudi notifica"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve essere usato dentro un ToastProvider");
  return ctx;
}
