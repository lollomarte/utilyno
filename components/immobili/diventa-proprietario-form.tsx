"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diventaProprietarioAction } from "@/app/actions/immobili";
import {
  diventaProprietarioSchema,
  type DiventaProprietarioInput,
  type DiventaProprietarioFormInput,
} from "@/lib/validations/immobile";
import { TIPO_IMMOBILE_LABELS } from "@/lib/labels";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatiAggiuntiviImmobileFields } from "@/components/immobili/dati-aggiuntivi-immobile-fields";
import { withTimeout } from "@/lib/utils";

/** Un utente già registrato attiva da solo anche il profilo Proprietario sul proprio account,
 * inserendo il primo immobile. Al successo l'azione fa signOut e reindirizza al login: il nuovo
 * profilo entra in sessione solo con un accesso nuovo (vedi commento su diventaProprietarioAction). */
export function DiventaProprietarioForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DiventaProprietarioFormInput, unknown, DiventaProprietarioInput>({
    resolver: zodResolver(diventaProprietarioSchema),
    defaultValues: { tipoImmobile: "RESIDENZIALE" },
  });

  async function onSubmit(data: DiventaProprietarioInput) {
    setServerError(null);
    try {
      const result = await withTimeout(diventaProprietarioAction(data));
      // Se l'azione ha successo non ritorna nulla: fa signOut e reindirizza da sola al login.
      if (result && !result.success) {
        setServerError(result.error);
      }
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-slate-500">
        Inserisci i tuoi dati e il primo immobile: al termine dovrai accedere di nuovo per vedere il nuovo profilo attivo.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="proprietarioCodiceFiscale">Codice fiscale</Label>
          <Input
            id="proprietarioCodiceFiscale"
            placeholder="RSSMRA80A01H501U"
            {...register("proprietarioCodiceFiscale")}
          />
          <FieldError message={errors.proprietarioCodiceFiscale?.message} />
        </div>
        <div>
          <Label htmlFor="proprietarioIndirizzo">Il tuo indirizzo</Label>
          <Input id="proprietarioIndirizzo" {...register("proprietarioIndirizzo")} />
          <FieldError message={errors.proprietarioIndirizzo?.message} />
        </div>
      </div>

      <div className="space-y-4 rounded-md bg-surface-muted p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Primo immobile</p>
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
        </div>
      </div>

      <DatiAggiuntiviImmobileFields register={register} errors={errors} />

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Attivazione in corso..." : "Attiva profilo Proprietario"}
      </Button>
    </form>
  );
}
