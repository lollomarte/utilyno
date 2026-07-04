"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Momento di brand puramente estetico al primo caricamento su mobile: non
 * blocca il rendering del contenuto sottostante (già montato in parallelo),
 * si limita a coprirlo per una frazione di secondo con una dissolvenza.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      return;
    }
    setVisible(true);
    const fadeTimer = setTimeout(() => setFading(true), 700);
    const removeTimer = setTimeout(() => setVisible(false), 1000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-primary transition-opacity duration-300 ease-out md:hidden",
        fading ? "opacity-0" : "opacity-100"
      )}
      aria-hidden="true"
    >
      <span className="text-3xl font-semibold tracking-tight text-white">LOQO</span>
    </div>
  );
}
