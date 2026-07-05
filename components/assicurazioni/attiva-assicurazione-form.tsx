"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attivaAssicurazioneAction } from "@/app/actions/assicurazioni";
import {
  attivaAssicurazioneSchema,
  TIPI_COPERTURA,
  type AttivaAssicurazioneInput,
  type AttivaAssicurazioneFormInput,
  type TipoCopertura,
} from "@/lib/validations/assicurazione";
import { PREMIO_SUGGERITO_PER_TIPO } from "@/lib/data/assicurazioni";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

export function AttivaAssicurazioneForm({
  immobileId,
  fornitoriDisponibili,
  onSuccess,
}: {
  immobileId: string;
  fornitoriDisponibili: string[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AttivaAssicurazioneFormInput, unknown, AttivaAssicurazioneInput>({
    resolver: zodResolver(attivaAssicurazioneSchema),
    defaultValues: {
      immobileId,
      tipo: TIPI_COPERTURA[2],
      fornitore: fornitoriDisponibili[0] ?? "",
      premioAnnuale: PREMIO_SUGGERITO_PER_TIPO[TIPI_COPERTURA[2]],
    },
  });

  function handleTipoChange(tipo: string) {
    setValue("premioAnnuale", PREMIO_SUGGERITO_PER_TIPO[tipo as TipoCopertura]);
  }

  async function onSubmit(data: AttivaAssicurazioneInput) {
    setServerError(null);
    try {
      const result = await withTimeout(attivaAssicurazioneAction(data));
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
      <div>
        <Label htmlFor="tipo">Tipo di copertura</Label>
        <Select id="tipo" {...register("tipo", { onChange: (e) => handleTipoChange(e.target.value) })}>
          {TIPI_COPERTURA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </Select>
        <FieldError message={errors.tipo?.message} />
      </div>
      <div>
        <Label htmlFor="fornitore">Fornitore</Label>
        <Select id="fornitore" {...register("fornitore")}>
          {fornitoriDisponibili.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
        <FieldError message={errors.fornitore?.message} />
      </div>
      <div>
        <Label htmlFor="premioAnnuale">Premio annuale (EUR)</Label>
        <Input id="premioAnnuale" type="number" min="0" step="1" {...register("premioAnnuale")} />
        <p className="mt-1 text-xs text-slate-400">Valore suggerito in base alla copertura, modificabile.</p>
        <FieldError message={errors.premioAnnuale?.message} />
      </div>
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Attivazione in corso..." : "Attiva copertura"}
      </Button>
    </form>
  );
}
