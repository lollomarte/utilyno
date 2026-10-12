"use client";

import { useActionState } from "react";
import { updateNextMatchInfoAction } from "@/lib/actions/nextMatch";
import { Button } from "@/components/Button";

export function NextMatchForm({
  initialData,
  initialOrario,
  initialCampo,
}: {
  initialData: string | null;
  initialOrario: string | null;
  initialCampo: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateNextMatchInfoAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="data">
          Data
        </label>
        <input
          id="data"
          name="data"
          type="date"
          defaultValue={initialData ?? ""}
          className="w-full border border-line bg-surface-2 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="orario">
          Orario
        </label>
        <input
          id="orario"
          name="orario"
          type="time"
          defaultValue={initialOrario?.slice(0, 5) ?? ""}
          className="w-full border border-line bg-surface-2 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="campo">
          Campo sportivo
        </label>
        <input
          id="campo"
          name="campo"
          type="text"
          placeholder="Es. Centro Sportivo Roma Sud"
          defaultValue={initialCampo ?? ""}
          className="w-full border border-line bg-surface-2 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <p className="text-xs text-muted">
        Lascia data e orario vuoti per tornare al default: prossimo lunedì alle 21:00.
      </p>

      {state?.error && <p className="text-sm text-loss">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? "Salvataggio..." : "Salva"}
      </Button>
    </form>
  );
}
