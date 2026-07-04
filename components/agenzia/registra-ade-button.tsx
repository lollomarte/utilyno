"use client";

import { useState, useTransition } from "react";
import { registraContrattoAdEAction, rinnovaRegistrazioneAction } from "@/app/actions/contratti";
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
        <p className="mt-2 text-sm text-accent">
          Registrazione simulata completata. Protocollo: <span className="font-mono">{protocollo}</span>
        </p>
      )}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

export function RinnovaRegistrazioneButton({ contrattoId }: { contrattoId: string }) {
  const [isPending, startTransition] = useTransition();
  const [protocollo, setProtocollo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await rinnovaRegistrazioneAction(contrattoId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setProtocollo(result.protocolloRinnovo);
    });
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleClick} disabled={isPending}>
        {isPending ? "Rinnovo in corso..." : "Rinnova registrazione annuale"}
      </Button>
      {protocollo && (
        <p className="mt-2 text-sm text-accent">
          Rinnovo simulato completato. Protocollo: <span className="font-mono">{protocollo}</span>
        </p>
      )}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
