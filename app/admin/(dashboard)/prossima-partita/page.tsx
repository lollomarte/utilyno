import { Suspense } from "react";
import { getNextMatchInfo } from "@/lib/data/nextMatch";
import { NextMatchForm } from "@/components/admin/NextMatchForm";
import { ToastOnQuery } from "@/components/ToastOnQuery";

export default async function ProssimaPartitaPage() {
  const info = await getNextMatchInfo();

  return (
    <div>
      <Suspense fallback={null}>
        <ToastOnQuery />
      </Suspense>
      <h1 className="font-display text-xl font-bold mb-1">Prossima partita</h1>
      <p className="text-sm text-muted mb-4">
        Imposta data, orario e campo del prossimo turno: compaiono in home page prima ancora che i risultati
        vengano registrati. Non è una partita giocata, quindi non entra nello storico.
      </p>
      <NextMatchForm
        initialData={info?.data ?? null}
        initialOrario={info?.orario ?? null}
        initialCampo={info?.campo ?? null}
      />
    </div>
  );
}
