"use client";

import dynamic from "next/dynamic";

/** Vedi incassi-chart-dynamic.tsx: stesso motivo, stesso trattamento. */
export const PagamentiDonut = dynamic(() => import("./pagamenti-donut").then((m) => m.PagamentiDonut), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-card bg-surface-sunken" />,
});
