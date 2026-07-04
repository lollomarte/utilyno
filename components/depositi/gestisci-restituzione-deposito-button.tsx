"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gestisciRestituzioneDepositoAction } from "@/app/actions/depositi";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

type Step = "scelta" | "conferma-restituzione" | "contestazione";

export function GestisciRestituzioneDepositoButton({
  contrattoId,
  depositoImporto,
  interessiStimati,
}: {
  contrattoId: string;
  depositoImporto: number;
  interessiStimati: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("scelta");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esitoConfermato, setEsitoConfermato] = useState<"RESTITUITO" | "IN_CONTESTAZIONE" | null>(null);

  function handleClose() {
    setOpen(false);
    setStep("scelta");
    setNote("");
    setError(null);
    setEsitoConfermato(null);
  }

  async function handleConfermaRestituzione() {
    setIsSubmitting(true);
    setError(null);
    const result = await gestisciRestituzioneDepositoAction({ contrattoId, esito: "RESTITUITO" });
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
    setEsitoConfermato("RESTITUITO");
  }

  async function handleConfermaContestazione() {
    if (!note.trim()) {
      setError("Indica il motivo della contestazione");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await gestisciRestituzioneDepositoAction({ contrattoId, esito: "IN_CONTESTAZIONE", note });
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
    setEsitoConfermato("IN_CONTESTAZIONE");
  }

  const totaleRestituzione = depositoImporto + interessiStimati;

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Gestisci restituzione deposito
      </Button>

      <Modal open={open} onClose={handleClose} title="Restituzione deposito cauzionale">
        {esitoConfermato === "RESTITUITO" && (
          <div className="space-y-4">
            <div className="rounded-control bg-accent-soft p-4 text-sm text-slate-700">
              Deposito restituito per un totale di <strong>{formatCurrency(totaleRestituzione)}</strong>.
            </div>
            <Button onClick={handleClose}>Chiudi</Button>
          </div>
        )}

        {esitoConfermato === "IN_CONTESTAZIONE" && (
          <div className="space-y-4">
            <div className="rounded-control bg-warning/10 p-4 text-sm text-warning ring-1 ring-inset ring-warning/30">
              Contestazione aperta. L&apos;inquilino vedrà lo stato &quot;In contestazione&quot; nel proprio portale.
            </div>
            <Button onClick={handleClose}>Chiudi</Button>
          </div>
        )}

        {!esitoConfermato && step === "scelta" && (
          <div className="space-y-4">
            <div className="rounded-control bg-surface-muted p-4 text-sm">
              <p className="flex justify-between py-1">
                <span className="text-slate-500">Deposito versato</span>
                <span className="font-medium text-ink">{formatCurrency(depositoImporto)}</span>
              </p>
              <p className="flex justify-between py-1">
                <span className="text-slate-500">Interessi legali maturati (0,5% annuo pro-rata)</span>
                <span className="font-medium text-ink">{formatCurrency(interessiStimati)}</span>
              </p>
              <p className="mt-1 flex justify-between border-t border-slate-200 py-1 pt-2">
                <span className="font-medium text-slate-700">Totale restituibile</span>
                <span className="font-semibold text-ink">{formatCurrency(totaleRestituzione)}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={() => setStep("conferma-restituzione")}>
                Restituzione regolare
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => setStep("contestazione")}>
                Apri contestazione
              </Button>
            </div>
          </div>
        )}

        {!esitoConfermato && step === "conferma-restituzione" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Confermi la restituzione di <strong>{formatCurrency(totaleRestituzione)}</strong> (deposito +
              interessi legali maturati) all&apos;inquilino?
            </p>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("scelta")} disabled={isSubmitting}>
                Indietro
              </Button>
              <Button onClick={handleConfermaRestituzione} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Elaborazione..." : "Conferma restituzione"}
              </Button>
            </div>
          </div>
        )}

        {!esitoConfermato && step === "contestazione" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="note-contestazione">Motivo della contestazione</Label>
              <Textarea
                id="note-contestazione"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Es. danni riscontrati in fase di uscita, da quantificare..."
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("scelta")} disabled={isSubmitting}>
                Indietro
              </Button>
              <Button variant="danger" onClick={handleConfermaContestazione} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Elaborazione..." : "Conferma contestazione"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
