"use client";

import dynamic from "next/dynamic";

/**
 * Recharts pesa da solo circa 100-150kB e raddoppiava il First Load JS delle
 * pagine che lo importavano staticamente (Admin/Agenzia/Proprietario, le uniche
 * a superare i ~106kB di baseline delle altre pagine). Caricandolo qui via
 * next/dynamic con ssr:false, il codice del grafico finisce in un chunk
 * separato invece di gonfiare il bundle iniziale di ogni pagina che lo usa.
 */
export const IncassiChart = dynamic(() => import("./incassi-chart").then((m) => m.IncassiChart), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-card bg-surface-sunken" />,
});
