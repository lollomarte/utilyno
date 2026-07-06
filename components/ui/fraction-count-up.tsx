"use client";

import { CountUp } from "@/components/ui/count-up";

export function FractionCountUp({ value, total }: { value: number; total: number }) {
  return <CountUp value={value} format={(n) => `${Math.round(n)}/${total}`} />;
}
