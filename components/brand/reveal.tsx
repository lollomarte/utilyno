"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Rivela il contenuto con una dissolvenza verso l'alto quando entra in
 * viewport, invece di mostrare tutto insieme al caricamento: un tocco
 * editoriale per una pagina che altrimenti non avrebbe JS lato client.
 * Rispetta prefers-reduced-motion tramite le keyframe stesse in globals.css.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={visible ? { animationDelay: `${delayMs}ms` } : undefined}>
      <div className={visible ? "reveal-visible" : "reveal-init"}>{children}</div>
    </div>
  );
}
