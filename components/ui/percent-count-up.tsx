"use client";

import { CountUp } from "@/components/ui/count-up";

export function PercentCountUp({ value, decimals = 2 }: { value: number; decimals?: number }) {
  return <CountUp value={value} format={(n) => `${n.toFixed(decimals)}%`} />;
}
