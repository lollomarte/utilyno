"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaImmobileProprietarioAction } from "@/app/actions/immobili";
import {
  nuovoImmobileProprietarioSchema,
  type NuovoImmobileProprietarioInput,
  type NuovoImmobileProprietarioFormInput,
} from "@/lib/validations/immobile";
import { TIPO_IMMOBILE_LABELS } from "@/lib/labels";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatiAggiuntiviImmobileFields } from "@/components/immobili/dati-aggiuntivi-immobile-fields";
import { withTimeout } from "@/lib/utils";

export function NuovoImmobileProprietarioForm({
  onSuccess,
}: {
  onSuccess?: (immobile: { id: string; indirizzo: string; comune: string; provincia: string }) => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NuovoImmobileProprietarioFormInput, unknown, NuovoImmobileProprietarioInput>({
    resolver: zodResolver(nuovoImmobileProprietarioSchema),
    defaultValues: { tipoImmobile: "RESIDENZIALE" },
  });

  async function onSubmit(data: NuovoImmobileProprietarioInput) {
    setServerError(null);
    try {
      const result = await withTimeout(creaImmobileProprietarioAction(data));
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      if (onSuccess) {
        onSuccess(result.immobile);
        return;
      }
      router.push("/privato");
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
      </div>

      <DatiAggiuntiviImmobileFields register={register} errors={errors} />

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creazione in corso..." : "Aggiungi immobile"}
      </Button>
    </form>
  );
}
