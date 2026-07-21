"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const colors = ["var(--color-accent)", "#ffffff", "var(--color-gold)"];

export function Confetti({ pieces = 40 }: { pieces?: number }) {
  const reduceMotion = useReducedMotion();

  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.2,
        rotate: Math.random() * 360,
        color: colors[i % colors.length],
        size: 5 + Math.random() * 5,
      })),
    [pieces]
  );

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {items.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: `${p.left}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            top: 0,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}
