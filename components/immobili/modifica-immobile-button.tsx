"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { aggiornaImmobileAction } from "@/app/actions/immobili";
import {
  aggiornaImmobileSchema,
  type AggiornaImmobileInput,
  type AggiornaImmobileFormInput,
} from "@/lib/validations/immobile";
import { TIPO_IMMOBILE_LABELS } from "@/lib/labels";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DatiAggiuntiviImmobileFields } from "@/components/immobili/dati-aggiuntivi-immobile-fields";
import { withTimeout } from "@/lib/utils";
import type { CondizioneImmobile, TipoImmobile, TipoRiscaldamento } from "@prisma/client";

export interface ImmobileDaModificare {
  id: string;
  indirizzo: string;
  comune: string;
  provincia: string;
  datiCatastali: string;
  superficieMq: number;
  tipoImmobile: TipoImmobile;
  apeClasse: string | null;
  valoreStimato: number;
  foglio: string | null;
  particella: string | null;
  subalterno: string | null;
  categoriaCatastale: string | null;
  renditaCatastale: number | null;
  apeScadenza: Date | null;
  numeroVani: number | null;
  piano: string | null;
  ascensore: boolean | null;
  annoCostruzione: number | null;
  condizioneImmobile: CondizioneImmobile | null;
  arredato: boolean | null;
  dotazioni: string[];
  tipoRiscaldamento: TipoRiscaldamento | null;
  speseCondominialiMensili: number | null;
  noteStima: string | null;
}

export function ModificaImmobileButton({ immobile }: { immobile: ImmobileDaModificare }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Modifica dati immobile
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifica dati immobile">
        <ModificaImmobileForm immobile={immobile} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function ModificaImmobileForm({ immobile, onSuccess }: { immobile: ImmobileDaModificare; onSuccess?: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AggiornaImmobileFormInput, unknown, AggiornaImmobileInput>({
    resolver: zodResolver(aggiornaImmobileSchema),
    defaultValues: {
      immobileId: immobile.id,
      indirizzo: immobile.indirizzo,
      comune: immobile.comune,
      provincia: immobile.provincia,
      datiCatastali: immobile.datiCatastali,
      superficieMq: immobile.superficieMq,
      tipoImmobile: immobile.tipoImmobile,
      apeClasse: immobile.apeClasse ?? "",
      valoreStimato: immobile.valoreStimato,
      foglio: immobile.foglio ?? "",
      particella: immobile.particella ?? "",
      subalterno: immobile.subalterno ?? "",
      categoriaCatastale: immobile.categoriaCatastale ?? "",
      renditaCatastale: immobile.renditaCatastale ?? undefined,
      apeScadenza: immobile.apeScadenza ? format(immobile.apeScadenza, "yyyy-MM-dd") : "",
      numeroVani: immobile.numeroVani ?? undefined,
      piano: immobile.piano ?? "",
      ascensore: immobile.ascensore ?? false,
      annoCostruzione: immobile.annoCostruzione ?? undefined,
      condizioneImmobile: immobile.condizioneImmobile ?? undefined,
      arredato: immobile.arredato ?? false,
      // L'input è testuale (comma-separated) e il valore viene ri-splittato al submit tramite
      // setValueAs in DatiAggiuntiviImmobileFields: qui serve solo per il pre-fill visivo.
      dotazioni: immobile.dotazioni.join(", ") as unknown as string[],
      tipoRiscaldamento: immobile.tipoRiscaldamento ?? undefined,
      speseCondominialiMensili: immobile.speseCondominialiMensili ?? undefined,
      noteStima: immobile.noteStima ?? "",
    },
  });

  async function onSubmit(data: AggiornaImmobileInput) {
    setServerError(null);
    try {
      const result = await withTimeout(aggiornaImmobileAction(data));
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      router.refresh();
      onSuccess?.();
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("immobileId")} />
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
          <Input id="provincia" maxLength={2} {...register("provincia")} />
          <FieldError message={errors.provincia?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="datiCatastali">Dati catastali</Label>
          <Input id="datiCatastali" {...register("datiCatastali")} />
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
          <Input id="apeClasse" {...register("apeClasse")} />
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
        {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
      </Button>
    </form>
  );
}
