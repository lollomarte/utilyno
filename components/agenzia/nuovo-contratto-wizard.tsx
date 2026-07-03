"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { creaContrattoAction } from "@/app/actions/contratti";
import { nuovoContrattoSchema, DURATA_MESI_PER_TIPO, type NuovoContrattoInput } from "@/lib/validations/contratto";
import { TIPO_CONTRATTO_LABELS, REGIME_FISCALE_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Immobile = { id: string; indirizzo: string; comune: string; provincia: string };
type Inquilino = { id: string; user: { nome: string; cognome: string; email: string } };

const STEPS = ["Immobile", "Inquilino", "Dati contratto", "Riepilogo"];

function addMonthsToDateString(dateString: string, months: number) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return format(date, "yyyy-MM-dd");
}

export function NuovoContrattoWizard({ immobili, inquilini }: { immobili: Immobile[]; inquilini: Inquilino[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const [form, setForm] = useState<Partial<NuovoContrattoInput>>({
    tipoContratto: "QUATTRO_PIU_QUATTRO",
    dataInizio: todayStr,
    dataFine: addMonthsToDateString(todayStr, DURATA_MESI_PER_TIPO.QUATTRO_PIU_QUATTRO),
    regimeFiscale: "CEDOLARE_SECCA",
  });

  const selectedImmobile = immobili.find((i) => i.id === form.immobileId);
  const selectedInquilino = inquilini.find((i) => i.id === form.inquilinoId);

  function updateTipoContratto(tipo: NuovoContrattoInput["tipoContratto"]) {
    setForm((prev) => ({
      ...prev,
      tipoContratto: tipo,
      dataFine: prev.dataInizio ? addMonthsToDateString(prev.dataInizio, DURATA_MESI_PER_TIPO[tipo]) : prev.dataFine,
    }));
  }

  function canProceed() {
    if (step === 0) return !!form.immobileId;
    if (step === 1) return !!form.inquilinoId;
    if (step === 2) return !!form.dataInizio && !!form.dataFine && !!form.canoneMensile && form.canoneMensile > 0;
    return true;
  }

  function handleSubmit() {
    setError(null);
    const parsed = nuovoContrattoSchema.safeParse(form);
    if (!parsed.success) {
      setError("Verifica i dati inseriti nei passaggi precedenti.");
      return;
    }
    startTransition(async () => {
      const result = await creaContrattoAction(parsed.data);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/agenzia/contratti/${result.contrattoId}`);
    });
  }

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-4 text-sm">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2",
              index === step ? "font-semibold text-slate-900" : "text-slate-400"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                index === step ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
              )}
            >
              {index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <Card>
        {step === 0 && (
          <div>
            <CardHeader title="Seleziona l'immobile" />
            <div className="space-y-2">
              {immobili.map((immobile) => (
                <label
                  key={immobile.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md border px-4 py-3 text-sm",
                    form.immobileId === immobile.id ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
                  )}
                >
                  <span>
                    {immobile.indirizzo}, {immobile.comune} ({immobile.provincia})
                  </span>
                  <input
                    type="radio"
                    name="immobileId"
                    className="h-4 w-4"
                    checked={form.immobileId === immobile.id}
                    onChange={() => setForm((prev) => ({ ...prev, immobileId: immobile.id }))}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <CardHeader title="Seleziona l'inquilino" />
            <div className="space-y-2">
              {inquilini.map((inquilino) => (
                <label
                  key={inquilino.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md border px-4 py-3 text-sm",
                    form.inquilinoId === inquilino.id ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
                  )}
                >
                  <span>
                    {inquilino.user.nome} {inquilino.user.cognome} &middot; {inquilino.user.email}
                  </span>
                  <input
                    type="radio"
                    name="inquilinoId"
                    className="h-4 w-4"
                    checked={form.inquilinoId === inquilino.id}
                    onChange={() => setForm((prev) => ({ ...prev, inquilinoId: inquilino.id }))}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <CardHeader title="Dati contratto" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tipoContratto">Tipo contratto</Label>
                <Select
                  id="tipoContratto"
                  value={form.tipoContratto}
                  onChange={(e) => updateTipoContratto(e.target.value as NuovoContrattoInput["tipoContratto"])}
                >
                  {Object.entries(TIPO_CONTRATTO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="regimeFiscale">Regime fiscale</Label>
                <Select
                  id="regimeFiscale"
                  value={form.regimeFiscale}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, regimeFiscale: e.target.value as NuovoContrattoInput["regimeFiscale"] }))
                  }
                >
                  {Object.entries(REGIME_FISCALE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="dataInizio">Data inizio</Label>
                <Input
                  id="dataInizio"
                  type="date"
                  value={form.dataInizio ?? ""}
                  onChange={(e) => {
                    const dataInizio = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      dataInizio,
                      dataFine: prev.tipoContratto
                        ? addMonthsToDateString(dataInizio, DURATA_MESI_PER_TIPO[prev.tipoContratto])
                        : prev.dataFine,
                    }));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="dataFine">Data fine</Label>
                <Input
                  id="dataFine"
                  type="date"
                  value={form.dataFine ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, dataFine: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="canoneMensile">Canone mensile (EUR)</Label>
                <Input
                  id="canoneMensile"
                  type="number"
                  min="0"
                  step="1"
                  value={form.canoneMensile ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, canoneMensile: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <CardHeader title="Riepilogo" description="Verifica i dati prima di creare il contratto" />
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Immobile</dt>
                <dd className="mt-1 text-slate-900">
                  {selectedImmobile ? `${selectedImmobile.indirizzo}, ${selectedImmobile.comune}` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Inquilino</dt>
                <dd className="mt-1 text-slate-900">
                  {selectedInquilino ? `${selectedInquilino.user.nome} ${selectedInquilino.user.cognome}` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Tipo contratto</dt>
                <dd className="mt-1 text-slate-900">{form.tipoContratto && TIPO_CONTRATTO_LABELS[form.tipoContratto]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Regime fiscale</dt>
                <dd className="mt-1 text-slate-900">{form.regimeFiscale && REGIME_FISCALE_LABELS[form.regimeFiscale]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Periodo</dt>
                <dd className="mt-1 text-slate-900">
                  {form.dataInizio} &rarr; {form.dataFine}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Canone mensile</dt>
                <dd className="mt-1 text-slate-900">{form.canoneMensile ? formatCurrency(form.canoneMensile) : "-"}</dd>
              </div>
            </dl>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || isPending}>
          Indietro
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canProceed()}>
            Avanti
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Creazione in corso..." : "Crea contratto"}
          </Button>
        )}
      </div>
    </div>
  );
}
