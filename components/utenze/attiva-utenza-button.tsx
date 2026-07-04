"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TipoUtenza } from "@prisma/client";
import { attivaUtenzaAction } from "@/app/actions/utenze";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { TIPO_UTENZA_LABELS } from "@/lib/labels";
import { withTimeout } from "@/lib/utils";

export function AttivaUtenzaButton({
  immobileId,
  tipo,
  fornitoriDisponibili,
}: {
  immobileId: string;
  tipo: TipoUtenza;
  fornitoriDisponibili: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fornitore, setFornitore] = useState(fornitoriDisponibili[0] ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attivata, setAttivata] = useState(false);

  function handleClose() {
    setOpen(false);
    setError(null);
    setAttivata(false);
  }

  async function handleConferma() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await withTimeout(attivaUtenzaAction({ immobileId, tipo, fornitore }));
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
      setAttivata(true);
    } catch {
      setError("Qualcosa è andato storto, riprova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Attiva utenza
      </Button>

      <Modal open={open} onClose={handleClose} title={`Attiva utenza ${TIPO_UTENZA_LABELS[tipo]}`}>
        {attivata ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-ink">
              Utenza {TIPO_UTENZA_LABELS[tipo]} attivata con {fornitore}.
            </p>
            <Button onClick={handleClose}>Chiudi</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`fornitore-${tipo}`}>Fornitore</Label>
              <Select id={`fornitore-${tipo}`} value={fornitore} onChange={(e) => setFornitore(e.target.value)}>
                {fornitoriDisponibili.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-slate-400">Simulazione: nessuna richiesta reale verrà inviata al fornitore.</p>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button onClick={handleConferma} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Attivazione..." : "Conferma attivazione"}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
