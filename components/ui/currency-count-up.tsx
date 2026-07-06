"use client";

import { CountUp } from "@/components/ui/count-up";
import { formatCurrency } from "@/lib/utils";

/** CountUp con formattazione valuta: esiste perché una funzione (formatCurrency)
 * non è serializzabile attraverso il confine RSC server→client se passata come
 * prop da un Server Component — qui la chiamata resta interna al client bundle. */
export function CurrencyCountUp({ value }: { value: number }) {
  return <CountUp value={value} format={formatCurrency} />;
}
