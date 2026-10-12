"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS, isNavItemActive } from "@/components/navItems";

export function NavDrawer({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  // Montato in un portal su document.body: se restasse annidato nell'header
  // (che ha position: sticky + backdrop-blur), l'header diventerebbe il
  // containing block dei figli position: fixed e il drawer verrebbe
  // "intrappolato" nella sua altezza di 56px invece di coprire il viewport.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
            className="fixed right-0 top-0 bottom-0 z-50 w-72 max-w-[80vw] bg-surface-2 border-l border-line-strong shadow-float flex flex-col lg:hidden"
            style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80 || info.velocity.x > 400) onClose();
            }}
          >
            <nav className="flex-1 overflow-y-auto py-3">
              {NAV_ITEMS.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`tap min-h-12 flex items-center gap-3 mx-2 px-3.5 rounded-md text-sm font-medium transition-colors ${
                      active ? "text-accent bg-accent-dim" : "text-ink hover:bg-surface-3"
                    }`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
                      {item.icon(active)}
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-line py-3">
              <Link
                href="/admin"
                onClick={onClose}
                className="tap min-h-12 flex items-center gap-3 mx-2 px-3.5 rounded-md text-sm text-muted hover:text-ink hover:bg-surface-3 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
                  <path
                    d="M6 10V7a6 6 0 1 1 12 0v3M5 10h14v10H5z"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                Admin
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
