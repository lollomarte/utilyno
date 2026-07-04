"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pagaOraAction } from "@/app/actions/pagamenti";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { METODO_PAGAMENTO_LABELS } from "@/lib/labels";
import type { METODO_PAGAMENTO_OPTIONS } from "@/lib/validations/pagamento";

type Metodo = (typeof METODO_PAGAMENTO_OPTIONS)[number];

export function PagaOraButton({
  pagamentoId,
  importo,
  indirizzo,
  dataScadenza,
}: {
  pagamentoId: string;
  importo: number;
  indirizzo: string;
  dataScadenza: Date;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [metodo, setMetodo] = useState<Metodo>("BONIFICO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esito, setEsito] = useState<{ dataAccredito: Date } | null>(null);

  function handleClose() {
    setOpen(false);
    setEsito(null);
    setError(null);
  }

  async function handleConferma() {
    setIsSubmitting(true);
    setError(null);
    const result = await pagaOraAction({ pagamentoId, metodo });
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
    setEsito({ dataAccredito: result.dataAccredito });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Paga ora</Button>

      <Modal open={open} onClose={handleClose} title="Paga canone">
        {esito ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-900">Pagamento registrato con successo.</p>
            <div className="rounded-control bg-accent-soft p-4 text-sm text-slate-700">
              Il proprietario riceverà l&apos;accredito entro il <strong>{formatDate(esito.dataAccredito)}</strong>.
            </div>
            <Button onClick={handleClose}>Chiudi</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-control bg-surface-muted p-4 text-sm">
              <p className="flex justify-between py-1">
                <span className="text-slate-500">Immobile</span>
                <span className="font-medium text-slate-900">{indirizzo}</span>
              </p>
              <p className="flex justify-between py-1">
                <span className="text-slate-500">Scadenza</span>
                <span className="font-medium text-slate-900">{formatDate(dataScadenza)}</span>
              </p>
              <p className="flex justify-between py-1">
                <span className="text-slate-500">Importo</span>
                <span className="font-medium text-slate-900">{formatCurrency(importo)}</span>
              </p>
            </div>

            <div>
              <Label htmlFor="metodo">Metodo di pagamento</Label>
              <Select id="metodo" value={metodo} onChange={(e) => setMetodo(e.target.value as Metodo)}>
                {Object.entries(METODO_PAGAMENTO_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-slate-400">Simulazione: nessun addebito reale verrà effettuato.</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button onClick={handleConferma} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Elaborazione..." : `Conferma pagamento di ${formatCurrency(importo)}`}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
