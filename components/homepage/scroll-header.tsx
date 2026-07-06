"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoqoSeal } from "@/components/brand/loqo-seal";
import { DemoTrigger } from "@/components/homepage/demo-trigger";
import { cn } from "@/lib/utils";

/**
 * Sopra l'hero è trasparente (il petrolio dell'hero traspare); superato
 * l'hero guadagna una superficie pietra opaca con un filo ottone — mai
 * vetro sfocato, coerente col concept "materiali opachi" del redesign.
 */
export function ScrollHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 64);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-all duration-[var(--duration-transition)] ease-[var(--ease-loqo)]",
        scrolled ? "border-accent/25 bg-surface shadow-card" : "border-transparent bg-transparent"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between px-6 transition-[padding] duration-[var(--duration-transition)] ease-[var(--ease-loqo)]",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <LoqoSeal size={24} color={scrolled ? "#0e2f3c" : "#ffffff"} ring={false} />
          <span
            className={cn(
              "font-display text-xl font-semibold tracking-tight transition-colors duration-[var(--duration-transition)]",
              scrolled ? "text-ink" : "text-white"
            )}
          >
            LOQO
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <DemoTrigger
            className={cn(
              "text-sm font-medium transition-colors duration-[var(--duration-transition)]",
              scrolled ? "text-ink-muted hover:text-ink" : "text-white/80 hover:text-white"
            )}
          >
            Richiedi demo
          </DemoTrigger>
          <Link
            href="/login"
            className={cn(
              "text-sm font-medium transition-colors duration-[var(--duration-transition)]",
              scrolled ? "text-ink hover:text-primary" : "text-white/80 hover:text-white"
            )}
          >
            Accedi
          </Link>
        </div>
      </div>
    </header>
  );
}
