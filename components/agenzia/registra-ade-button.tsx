"use client";

import { useState, useTransition } from "react";
import { registraContrattoAdEAction } from "@/app/actions/contratti";
import { Button } from "@/components/ui/button";

export function RegistraAdEButton({ contrattoId }: { contrattoId: string }) {
  const [isPending, startTransition] = useTransition();
  const [protocollo, setProtocollo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await registraContrattoAdEAction(contrattoId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setProtocollo(result.protocollo);
    });
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleClick} disabled={isPending}>
        {isPending ? "Registrazione in corso..." : "Registra all'Agenzia delle Entrate"}
      </Button>
      {protocollo && (
        <p className="mt-2 text-sm text-emerald-700">
          Registrazione simulata completata. Protocollo: <span className="font-mono">{protocollo}</span>
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
