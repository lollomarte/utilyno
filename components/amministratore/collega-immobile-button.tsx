"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { collegaImmobileEsistenteAction, creaImmobilePerCondominioAction } from "@/app/actions/immobili";
import {
  creaImmobilePerCondominioSchema,
  type CreaImmobilePerCondominioInput,
  type CreaImmobilePerCondominioFormInput,
} from "@/lib/validations/immobile";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { TIPO_IMMOBILE_LABELS } from "@/lib/labels";
import { cn, withTimeout } from "@/lib/utils";

type ImmobileDisponibile = {
  id: string;
  indirizzo: string;
  comune: string;
  proprietario: { user: { nome: string; cognome: string } };
};
type Agenzia = { id: string; ragioneSociale: string };
type Proprietario = { id: string; user: { nome: string; cognome: string; email: string } };

export function CollegaImmobileButton({
  condominioId,
  immobiliDisponibili,
  agenzie,
  proprietari,
}: {
  condominioId: string;
  immobiliDisponibili: ImmobileDisponibile[];
  agenzie: Agenzia[];
  proprietari: Proprietario[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"esistente" | "nuovo">("esistente");

  function handleClose() {
    setOpen(false);
    setTab("esistente");
  }

  function handleSuccess() {
    router.refresh();
    handleClose();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Collega immobile</Button>

      <Modal open={open} onClose={handleClose} title="Collega unità al condominio">
        <div className="mb-4 flex gap-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab("esistente")}
            className={cn(
              "border-b-2 px-1 pb-2 text-sm font-medium",
              tab === "esistente" ? "border-primary text-ink" : "border-transparent text-slate-500"
            )}
          >
            Immobile esistente
          </button>
          <button
            type="button"
            onClick={() => setTab("nuovo")}
            className={cn(
              "border-b-2 px-1 pb-2 text-sm font-medium",
              tab === "nuovo" ? "border-primary text-ink" : "border-transparent text-slate-500"
            )}
          >
            Nuovo immobile
          </button>
        </div>

        {tab === "esistente" ? (
          <CollegaEsistenteForm condominioId={condominioId} immobili={immobiliDisponibili} onSuccess={handleSuccess} />
        ) : (
          <CreaImmobileForm condominioId={condominioId} agenzie={agenzie} proprietari={proprietari} onSuccess={handleSuccess} />
        )}
      </Modal>
    </>
  );
}

function CollegaEsistenteForm({
  condominioId,
  immobili,
  onSuccess,
}: {
  condominioId: string;
  immobili: ImmobileDisponibile[];
  onSuccess: () => void;
}) {
  const [immobileId, setImmobileId] = useState(immobili[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConferma() {
    if (!immobileId) {
      setError("Seleziona un immobile");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await withTimeout(collegaImmobileEsistenteAction({ condominioId, immobileId }));
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSuccess();
    } catch {
      setError("Qualcosa è andato storto, riprova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (immobili.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nessun immobile disponibile da collegare: tutti gli immobili esistenti risultano già assegnati a un condominio.
        Usa &quot;Nuovo immobile&quot; per crearne uno.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="immobileId">Immobile (non ancora assegnato a un condominio)</Label>
        <Select id="immobileId" value={immobileId} onChange={(e) => setImmobileId(e.target.value)}>
          {immobili.map((i) => (
            <option key={i.id} value={i.id}>
              {i.indirizzo}, {i.comune} &middot; {i.proprietario.user.nome} {i.proprietario.user.cognome}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button onClick={handleConferma} disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Collegamento..." : "Collega immobile"}
      </Button>
    </div>
  );
}

function CreaImmobileForm({
  condominioId,
  agenzie,
  proprietari,
  onSuccess,
}: {
  condominioId: string;
  agenzie: Agenzia[];
  proprietari: Proprietario[];
  onSuccess: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreaImmobilePerCondominioFormInput, unknown, CreaImmobilePerCondominioInput>({
    resolver: zodResolver(creaImmobilePerCondominioSchema),
    defaultValues: { condominioId, proprietarioMode: "esistente", tipoImmobile: "RESIDENZIALE" },
  });

  const proprietarioMode = watch("proprietarioMode");

  async function onSubmit(data: CreaImmobilePerCondominioInput) {
    setServerError(null);
    try {
      const result = await withTimeout(creaImmobilePerCondominioAction(data));
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            setError(field as keyof CreaImmobilePerCondominioFormInput, { message });
          }
        }
        setServerError(result.error);
        return;
      }
      onSuccess();
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="indirizzo">Indirizzo</Label>
          <Input id="indirizzo" {...register("indirizzo")} />
          <FieldError message={errors.indirizzo?.message} />
        </div>
        <div>
          <Label htmlFor="comune">Comune</Label>
          <Input id="comune" {...register("comune")} />
          <FieldError message={errors.comune?.message} />
        </div>
        <div>
          <Label htmlFor="provincia">Provincia (sigla)</Label>
          <Input id="provincia" maxLength={2} placeholder="MI" {...register("provincia")} />
          <FieldError message={errors.provincia?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="datiCatastali">Dati catastali</Label>
          <Input id="datiCatastali" placeholder="Fg. 1, Part. 100, Sub. 1" {...register("datiCatastali")} />
          <FieldError message={errors.datiCatastali?.message} />
        </div>
        <div>
          <Label htmlFor="superficieMq">Superficie (m²)</Label>
          <Input id="superficieMq" type="number" min="0" step="1" {...register("superficieMq")} />
          <FieldError message={errors.superficieMq?.message} />
        </div>
        <div>
          <Label htmlFor="tipoImmobile">Tipo immobile</Label>
          <Select id="tipoImmobile" {...register("tipoImmobile")}>
            {Object.entries(TIPO_IMMOBILE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="valoreStimato">Valore stimato (EUR)</Label>
          <Input id="valoreStimato" type="number" min="0" step="1000" {...register("valoreStimato")} />
          <FieldError message={errors.valoreStimato?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="agenziaId">Agenzia di riferimento</Label>
          <Select id="agenziaId" {...register("agenziaId")}>
            <option value="">Seleziona...</option>
            {agenzie.map((a) => (
              <option key={a.id} value={a.id}>
                {a.ragioneSociale}
              </option>
            ))}
          </Select>
          <FieldError message={errors.agenziaId?.message} />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <Label htmlFor="proprietarioMode">Proprietario</Label>
        <Select id="proprietarioMode" {...register("proprietarioMode")}>
          <option value="esistente">Proprietario esistente</option>
          <option value="nuovo">Nuovo proprietario</option>
        </Select>
      </div>

      {proprietarioMode === "esistente" ? (
        <div>
          <Label htmlFor="proprietarioId">Seleziona proprietario</Label>
          <Select id="proprietarioId" {...register("proprietarioId")}>
            <option value="">Seleziona...</option>
            {proprietari.map((p) => (
              <option key={p.id} value={p.id}>
                {p.user.nome} {p.user.cognome} &middot; {p.user.email}
              </option>
            ))}
          </Select>
          <FieldError message={errors.proprietarioId?.message} />
        </div>
      ) : (
        <div className="space-y-4 rounded-md bg-surface-muted p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nuovo proprietario</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="proprietarioNome">Nome</Label>
              <Input id="proprietarioNome" {...register("proprietarioNome")} />
              <FieldError message={errors.proprietarioNome?.message} />
            </div>
            <div>
              <Label htmlFor="proprietarioCognome">Cognome</Label>
              <Input id="proprietarioCognome" {...register("proprietarioCognome")} />
              <FieldError message={errors.proprietarioCognome?.message} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="proprietarioEmail">Email</Label>
              <Input id="proprietarioEmail" type="email" {...register("proprietarioEmail")} />
              <FieldError message={errors.proprietarioEmail?.message} />
            </div>
            <div>
              <Label htmlFor="proprietarioCodiceFiscale">Codice fiscale</Label>
              <Input id="proprietarioCodiceFiscale" placeholder="RSSMRA80A01H501U" {...register("proprietarioCodiceFiscale")} />
              <FieldError message={errors.proprietarioCodiceFiscale?.message} />
            </div>
            <div>
              <Label htmlFor="proprietarioIndirizzo">Indirizzo</Label>
              <Input id="proprietarioIndirizzo" {...register("proprietarioIndirizzo")} />
              <FieldError message={errors.proprietarioIndirizzo?.message} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="proprietarioPassword">Password provvisoria</Label>
              <Input id="proprietarioPassword" type="password" {...register("proprietarioPassword")} />
              <FieldError message={errors.proprietarioPassword?.message} />
            </div>
          </div>
        </div>
      )}

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creazione in corso..." : "Crea e collega immobile"}
      </Button>
    </form>
  );
}
