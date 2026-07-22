"use client";

import { motion } from "framer-motion";

export function Sparkline({
  values,
  width = 280,
  height = 56,
  color = "var(--color-accent)",
  gradientId = "sparkline-fill",
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  gradientId?: string;
}) {
  if (values.length < 2) return null;

  const max = Math.max(1, ...values);
  const padY = 6;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - padY - (v / max) * (height - padY * 2);
    return [x, y] as const;
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ maxWidth: width, display: "block" }}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={values[i] > 0 ? 2.5 : 1.5} fill={color} />
      ))}
    </svg>
  );
}
