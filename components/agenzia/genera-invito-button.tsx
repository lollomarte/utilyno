"use client";

import { useState, useTransition } from "react";
import { generaInvitoAction } from "@/app/actions/inviti";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function GeneraInvitoButton({ contrattoId }: { contrattoId: string }) {
  const [isPending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [scadenza, setScadenza] = useState<Date | null>(null);
  const [copiato, setCopiato] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    setCopiato(false);
    startTransition(async () => {
      const result = await generaInvitoAction(contrattoId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setLink(`${window.location.origin}/invito/${result.token}`);
      setScadenza(result.scadenza);
    });
  }

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiato(true);
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleClick} disabled={isPending}>
        {isPending ? "Generazione in corso..." : "Genera link di invito"}
      </Button>
      {link && (
        <div className="mt-3 space-y-2">
          <p className="break-all rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-900">{link}</p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={handleCopy}>
              {copiato ? "Copiato" : "Copia link"}
            </Button>
            {scadenza && <p className="text-xs text-slate-500">Valido fino al {formatDate(scadenza)}</p>}
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
