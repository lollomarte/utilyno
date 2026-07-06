"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Su mobile scorre dall'alto verso il basso come una bottom sheet (angoli
 * arrotondati solo in alto, ancorata al fondo); su desktop resta un dialogo
 * centrato classico. Nessun cambiamento richiesto ai punti di utilizzo.
 *
 * Intestazione (titolo + chiudi) fuori dall'area di scroll: resta sempre
 * visibile anche quando il contenuto del form è più alto del modale.
 * Il focus è intrappolato dentro il modale mentre è aperto e torna
 * all'elemento che lo ha aperto alla chiusura.
 *
 * Renderizzato in un portal su document.body: un antenato (il wrapper
 * delle page transition nel layout di piattaforma) applica una CSS
 * transform per la propria animazione, e qualunque transform su un
 * antenato trasforma quell'elemento nel containing block per i figli
 * "position: fixed" — senza il portal, "fixed inset-0" smetterebbe di
 * coprire il viewport reale e si limiterebbe al riquadro di quell'antenato.
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
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("[data-modal-close]")?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      previouslyFocused.current?.focus();
      previouslyFocused.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!rendered || !mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center bg-primary/50 transition-opacity duration-[var(--duration-transition)] ease-[var(--ease-loqo)] md:items-center md:px-4",
        entered ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-sheet bg-surface shadow-sheet transition-transform duration-[var(--duration-transition)] ease-[var(--ease-loqo)] md:max-w-lg md:rounded-sheet",
          entered ? "translate-y-0" : "translate-y-full md:translate-y-4"
        )}
      >
        <div className="shrink-0 border-b border-border px-6 pb-4 pt-6">
          <div className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-border md:hidden" aria-hidden="true" />
          <div className="flex items-center justify-between gap-4">
            <h2 id="modal-title" className="font-display text-lg font-semibold text-ink">
              {title}
            </h2>
            <button
              type="button"
              data-modal-close
              onClick={onClose}
              className="touch-target flex shrink-0 items-center justify-center text-ink-subtle hover:text-ink"
              aria-label="Chiudi"
            >
              ✕
            </button>
          </div>
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto px-6 pt-4"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
