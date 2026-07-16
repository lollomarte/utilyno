"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { creaContrattoAction } from "@/app/actions/contratti";
import { nuovoContrattoSchema, DURATA_MESI_PER_TIPO, type NuovoContrattoInput } from "@/lib/validations/contratto";
import { TIPO_CONTRATTO_LABELS, REGIME_FISCALE_LABELS } from "@/lib/labels";
import { formatCurrency, withTimeout } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { NuovoImmobileForm } from "@/components/agenzia/nuovo-immobile-form";
import { cn } from "@/lib/utils";

type Immobile = { id: string; indirizzo: string; comune: string; provincia: string };
type Inquilino = { id: string; user: { nome: string; cognome: string; email: string } };
type Proprietario = { id: string; user: { nome: string; cognome: string; email: string } };
type Condominio = { id: string; nome: string; comune: string };

const STEPS = ["Immobile", "Inquilino", "Dati contratto e deposito", "Riepilogo"];

function addMonthsToDateString(dateString: string, months: number) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return format(date, "yyyy-MM-dd");
}

export function NuovoContrattoWizard({
  immobiliIniziali,
  inquilini,
  proprietari,
  condomini,
}: {
  immobiliIniziali: Immobile[];
  inquilini: Inquilino[];
  proprietari: Proprietario[];
  condomini: Condominio[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [immobili, setImmobili] = useState<Immobile[]>(immobiliIniziali);
  const [modalAperto, setModalAperto] = useState(false);
  const [depositoTouched, setDepositoTouched] = useState(false);
  const [esitoCreazione, setEsitoCreazione] = useState<{
    contrattoId: string;
    inquilinoTemporaryPassword?: string;
    inquilinoEmail?: string;
    /** L'email inserita corrispondeva già a un account esistente (es. la persona è già
     * Proprietario altrove): il contratto è stato collegato a quell'account, nessuna nuova
     * password da comunicare. */
    accountEsistente?: boolean;
  } | null>(null);
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const [form, setForm] = useState<Partial<NuovoContrattoInput>>({
    tipoContratto: "QUATTRO_PIU_QUATTRO",
    dataInizio: todayStr,
    dataFine: addMonthsToDateString(todayStr, DURATA_MESI_PER_TIPO.QUATTRO_PIU_QUATTRO),
    regimeFiscale: "CEDOLARE_SECCA",
    inquilinoMode: "esistente",
  });

  const selectedImmobile = immobili.find((i) => i.id === form.immobileId);
  const selectedInquilino = inquilini.find((i) => i.id === form.inquilinoId);

  function handleImmobileCreato(nuovoImmobile: Immobile) {
    // Lo stato del wizard (step corrente, inquilino/dati già inseriti) resta
    // intatto: il form vive in un modal sopra questo stesso componente,
    // nessuna navigazione di pagina avviene.
    setImmobili((prev) => [...prev, nuovoImmobile]);
    setForm((prev) => ({ ...prev, immobileId: nuovoImmobile.id }));
    setModalAperto(false);
  }

  function updateTipoContratto(tipo: NuovoContrattoInput["tipoContratto"]) {
    setForm((prev) => ({
      ...prev,
      tipoContratto: tipo,
      dataFine: prev.dataInizio ? addMonthsToDateString(prev.dataInizio, DURATA_MESI_PER_TIPO[tipo]) : prev.dataFine,
    }));
  }

  function canProceed() {
    if (step === 0) return !!form.immobileId;
    if (step === 1) {
      if (form.inquilinoMode === "nuovo") {
        return !!form.inquilinoNome && !!form.inquilinoCognome && !!form.inquilinoEmail && !!form.inquilinoCodiceFiscale;
      }
      return !!form.inquilinoId;
    }
    if (step === 2)
      return (
        !!form.dataInizio &&
        !!form.dataFine &&
        !!form.canoneMensile &&
        form.canoneMensile > 0 &&
        form.depositoImporto !== undefined &&
        form.depositoImporto >= 0
      );
    return true;
  }

  function handleSubmit() {
    setError(null);
    setFieldErrors({});
    const parsed = nuovoContrattoSchema.safeParse(form);
    if (!parsed.success) {
      setError("Verifica i dati inseriti nei passaggi precedenti.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await withTimeout(creaContrattoAction(parsed.data));
        if (!result.success) {
          setError(result.error);
          if (result.fieldErrors) setFieldErrors(result.fieldErrors);
          return;
        }
        if (result.inquilinoTemporaryPassword) {
          setEsitoCreazione({
            contrattoId: result.contrattoId,
            inquilinoTemporaryPassword: result.inquilinoTemporaryPassword,
            inquilinoEmail: result.inquilinoEmail,
          });
          return;
        }
        if (form.inquilinoMode === "nuovo") {
          // L'email inserita corrispondeva già a un account (es. la persona è già Proprietario
          // altrove): il contratto si è collegato a quello, va comunicato — non c'è nessuna
          // password provvisoria da mostrare in questo caso.
          setEsitoCreazione({ contrattoId: result.contrattoId, accountEsistente: true });
          return;
        }
        router.push(`/agenzia/contratti/${result.contrattoId}`);
      } catch {
        setError("Qualcosa è andato storto, riprova.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap items-center gap-4 text-sm">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2",
              index === step ? "font-semibold text-ink" : "text-slate-400"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                index === step ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
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
            <div className="mb-4 flex items-center justify-between">
              <CardHeader title="Seleziona l'immobile" />
              <Button type="button" variant="secondary" onClick={() => setModalAperto(true)}>
                Aggiungi nuovo immobile
              </Button>
            </div>
            {immobili.length === 0 ? (
              <p className="rounded-md bg-surface-muted p-4 text-sm text-slate-500">
                Non hai ancora nessun immobile. Usa &quot;Aggiungi nuovo immobile&quot; per crearne uno senza perdere
                i dati già inseriti in questo wizard.
              </p>
            ) : (
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
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <CardHeader title="Seleziona l'inquilino" />
            <div className="mb-4">
              <Label htmlFor="inquilinoMode">Inquilino</Label>
              <Select
                id="inquilinoMode"
                value={form.inquilinoMode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, inquilinoMode: e.target.value as NuovoContrattoInput["inquilinoMode"] }))
                }
              >
                <option value="esistente">Inquilino esistente</option>
                <option value="nuovo">Nuovo inquilino</option>
              </Select>
            </div>

            {form.inquilinoMode === "esistente" ? (
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
            ) : (
              <div className="space-y-4 rounded-md bg-surface-muted p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nuovo inquilino</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="inquilinoNome">Nome</Label>
                    <Input
                      id="inquilinoNome"
                      value={form.inquilinoNome ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, inquilinoNome: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquilinoCognome">Cognome</Label>
                    <Input
                      id="inquilinoCognome"
                      value={form.inquilinoCognome ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, inquilinoCognome: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="inquilinoEmail">Email</Label>
                    <Input
                      id="inquilinoEmail"
                      type="email"
                      value={form.inquilinoEmail ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, inquilinoEmail: e.target.value }))}
                    />
                    {fieldErrors.inquilinoEmail && <p className="mt-1 text-xs text-danger">{fieldErrors.inquilinoEmail}</p>}
                  </div>
                  <div>
                    <Label htmlFor="inquilinoCodiceFiscale">Codice fiscale</Label>
                    <Input
                      id="inquilinoCodiceFiscale"
                      placeholder="RSSMRA80A01H501U"
                      value={form.inquilinoCodiceFiscale ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, inquilinoCodiceFiscale: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquilinoTelefono">Telefono (opzionale)</Label>
                    <Input
                      id="inquilinoTelefono"
                      value={form.inquilinoTelefono ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, inquilinoTelefono: e.target.value }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Se l&apos;email non è già associata a un account, ne verrà creato uno nuovo con una password
                  provvisoria (mostrata al termine della creazione del contratto). Se è già associata a un account
                  esistente (es. la persona è già Proprietario su LOQO), il contratto verrà collegato a quell&apos;account.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <CardHeader title="Dati contratto e deposito" />
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
                  onChange={(e) =>
                    setForm((prev) => {
                      const canoneMensile = Number(e.target.value);
                      return {
                        ...prev,
                        canoneMensile,
                        depositoImporto: depositoTouched ? prev.depositoImporto : canoneMensile * 2,
                      };
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="depositoImporto">Deposito cauzionale (EUR)</Label>
                <Input
                  id="depositoImporto"
                  type="number"
                  min="0"
                  step="1"
                  value={form.depositoImporto ?? ""}
                  onChange={(e) => {
                    setDepositoTouched(true);
                    setForm((prev) => ({ ...prev, depositoImporto: Number(e.target.value) }));
                  }}
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
                <dd className="mt-1 text-ink">
                  {selectedImmobile ? `${selectedImmobile.indirizzo}, ${selectedImmobile.comune}` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Inquilino</dt>
                <dd className="mt-1 text-ink">
                  {form.inquilinoMode === "nuovo"
                    ? `${form.inquilinoNome ?? ""} ${form.inquilinoCognome ?? ""} (nuovo account, o esistente se l'email è già registrata)`
                    : selectedInquilino
                      ? `${selectedInquilino.user.nome} ${selectedInquilino.user.cognome}`
                      : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Tipo contratto</dt>
                <dd className="mt-1 text-ink">{form.tipoContratto && TIPO_CONTRATTO_LABELS[form.tipoContratto]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Regime fiscale</dt>
                <dd className="mt-1 text-ink">{form.regimeFiscale && REGIME_FISCALE_LABELS[form.regimeFiscale]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Periodo</dt>
                <dd className="mt-1 text-ink">
                  {form.dataInizio} &rarr; {form.dataFine}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Canone mensile</dt>
                <dd className="mt-1 text-ink">{form.canoneMensile ? formatCurrency(form.canoneMensile) : "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-slate-400">Deposito cauzionale</dt>
                <dd className="mt-1 text-ink">
                  {form.depositoImporto !== undefined ? formatCurrency(form.depositoImporto) : "-"}
                </dd>
              </div>
            </dl>
            {error && <p className="mt-4 text-sm text-danger">{error}</p>}
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

      <Modal open={modalAperto} onClose={() => setModalAperto(false)} title="Aggiungi nuovo immobile">
        <NuovoImmobileForm proprietari={proprietari} condomini={condomini} onSuccess={handleImmobileCreato} />
      </Modal>

      <Modal open={!!esitoCreazione} onClose={() => {}} title="Contratto creato">
        <div className="space-y-4">
          {esitoCreazione?.accountEsistente ? (
            <p className="text-sm text-slate-600">
              L&apos;email inserita era già associata a un account esistente su LOQO: il contratto è stato collegato a
              quell&apos;account, che ora vede anche questo immobile tra i propri. Non è stato creato nessun account
              nuovo né una password provvisoria.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                È stato creato un nuovo account per l&apos;inquilino <strong>{esitoCreazione?.inquilinoEmail}</strong> con la
                seguente password provvisoria. Comunicala all&apos;inquilino in modo sicuro: non sarà più visibile dopo questo
                passaggio.
              </p>
              <p className="rounded-md bg-slate-100 px-4 py-3 font-mono text-sm text-ink">
                {esitoCreazione?.inquilinoTemporaryPassword}
              </p>
            </>
          )}
          <Button
            onClick={() => {
              if (esitoCreazione) router.push(`/agenzia/contratti/${esitoCreazione.contrattoId}`);
            }}
          >
            Vai al contratto
          </Button>
        </div>
      </Modal>
    </div>
  );
}
