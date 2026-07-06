"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Anima da 0 al valore reale quando entra in viewport (stesso pattern del
 * componente Reveal), poi fissa il valore reale — mai un ciclo infinito.
 * Con prefers-reduced-motion mostra subito il valore finale.
 */
export function CountUp({
  value,
  format = (n: number) => String(Math.round(n)),
  durationMs = 900,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!started || reduceMotion) return;
    const startTime = performance.now();
    // Decelerazione coerente con --ease-loqo (cubic-bezier(0.22,1,0.36,1)),
    // qui come funzione JS perché anima un valore numerico, non una proprietà CSS.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    let frame: number;
    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      setDisplay(value * ease(t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}
