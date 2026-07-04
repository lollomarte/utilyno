import { AlertTriangle } from "lucide-react";

export function PagamentiInRitardoBanner({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-control bg-red-50 p-4 ring-1 ring-inset ring-red-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
        <p className="text-sm font-medium text-red-800">
          Hai {count} {count === 1 ? "pagamento in ritardo" : "pagamenti in ritardo"}. Regolarizza la tua posizione al più
          presto per evitare ulteriori disagi.
        </p>
      </div>
      <a
        href="#storico-pagamenti"
        className="shrink-0 whitespace-nowrap text-sm font-semibold text-red-700 underline underline-offset-2"
      >
        Vai ai pagamenti
      </a>
    </div>
  );
}
