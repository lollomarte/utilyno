"use client";

import { motion } from "framer-motion";

export function ProgressBar({ ratio, color = "var(--color-accent)" }: { ratio: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full opacity-[0.14]"
        style={{ background: color }}
      />
    </div>
  );
}
