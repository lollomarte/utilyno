"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaImmobileAction } from "@/app/actions/immobili";
import { nuovoImmobileSchema, type NuovoImmobileInput, type NuovoImmobileFormInput } from "@/lib/validations/immobile";
import { TIPO_IMMOBILE_LABELS } from "@/lib/labels";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

type Proprietario = { id: string; user: { nome: string; cognome: string; email: string } };
type Condominio = { id: string; nome: string; comune: string };

export function NuovoImmobileForm({
  proprietari,
  condomini,
  onSuccess,
}: {
  proprietari: Proprietario[];
  condomini: Condominio[];
  onSuccess?: (immobile: { id: string; indirizzo: string; comune: string; provincia: string }) => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NuovoImmobileFormInput, unknown, NuovoImmobileInput>({
    resolver: zodResolver(nuovoImmobileSchema),
    defaultValues: { proprietarioMode: "esistente", tipoImmobile: "RESIDENZIALE" },
  });

  const proprietarioMode = watch("proprietarioMode");

  async function onSubmit(data: NuovoImmobileInput) {
    setServerError(null);
    try {
      const result = await withTimeout(creaImmobileAction(data));

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            setError(field as keyof NuovoImmobileFormInput, { message });
          }
        }
        setServerError(result.error);
        return;
      }

      if (onSuccess) {
        onSuccess(result.immobile);
        return;
      }

      router.push("/agenzia/immobili");
      router.refresh();
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
        <div>
          <Label htmlFor="apeClasse">Classe APE (opzionale)</Label>
          <Input id="apeClasse" placeholder="B" {...register("apeClasse")} />
        </div>
        <div>
          <Label htmlFor="valoreStimato">Valore stimato (EUR)</Label>
          <Input id="valoreStimato" type="number" min="0" step="1000" {...register("valoreStimato")} />
          <FieldError message={errors.valoreStimato?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="condominioId">Condominio (opzionale)</Label>
          <Select id="condominioId" {...register("condominioId")}>
            <option value="">Nessuno</option>
            {condomini.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} - {c.comune}
              </option>
            ))}
          </Select>
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creazione in corso..." : "Crea immobile"}
      </Button>
    </form>
  );
}
