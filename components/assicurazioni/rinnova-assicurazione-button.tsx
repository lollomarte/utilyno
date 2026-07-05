"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addYears } from "date-fns";
import { rinnovaAssicurazioneAction } from "@/app/actions/assicurazioni";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label, Input } from "@/components/ui/input";
import { formatCurrency, formatDate, withTimeout } from "@/lib/utils";

export function RinnovaAssicurazioneButton({
  assicurazioneId,
  premioAnnualeAttuale,
  dataScadenzaAttuale,
}: {
  assicurazioneId: string;
  premioAnnualeAttuale: number;
  dataScadenzaAttuale: Date;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [premio, setPremio] = useState(String(premioAnnualeAttuale));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rinnovata, setRinnovata] = useState(false);

  const basePartenza = dataScadenzaAttuale > new Date() ? dataScadenzaAttuale : new Date();
  const nuovaScadenza = addYears(basePartenza, 1);

  function handleClose() {
    setOpen(false);
    setError(null);
    setRinnovata(false);
    setPremio(String(premioAnnualeAttuale));
  }

  async function handleConferma() {
    const premioAnnuale = Number(premio);
    if (!premioAnnuale || premioAnnuale <= 0) {
      setError("Il premio annuale deve essere maggiore di zero");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await withTimeout(rinnovaAssicurazioneAction({ assicurazioneId, premioAnnuale }));
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
      setRinnovata(true);
    } catch {
      setError("Qualcosa è andato storto, riprova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Rinnova
      </Button>

      <Modal open={open} onClose={handleClose} title="Rinnova copertura assicurativa">
        {rinnovata ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-ink">
              Copertura rinnovata fino al {formatDate(nuovaScadenza)}.
            </p>
            <Button onClick={handleClose}>Chiudi</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-control bg-surface-muted p-4 text-sm">
              <p className="flex justify-between py-1">
                <span className="text-slate-500">Scadenza attuale</span>
                <span className="font-medium text-ink">{formatDate(dataScadenzaAttuale)}</span>
              </p>
              <p className="flex justify-between py-1">
                <span className="text-slate-500">Nuova scadenza</span>
                <span className="font-medium text-ink">{formatDate(nuovaScadenza)}</span>
              </p>
            </div>
            <div>
              <Label htmlFor="premioRinnovo">Premio annuale (EUR)</Label>
              <Input
                id="premioRinnovo"
                type="number"
                min="0"
                step="1"
                value={premio}
                onChange={(e) => setPremio(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">
                Premio attuale: {formatCurrency(premioAnnualeAttuale)}. Modificalo se cambiato.
              </p>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button onClick={handleConferma} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Rinnovo in corso..." : "Conferma rinnovo"}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
