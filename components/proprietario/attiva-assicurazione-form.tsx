"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attivaAssicurazioneAction } from "@/app/actions/assicurazioni";
import {
  attivaAssicurazioneSchema,
  type AttivaAssicurazioneInput,
  type AttivaAssicurazioneFormInput,
} from "@/lib/validations/assicurazione";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AttivaAssicurazioneForm({ immobileId, onSuccess }: { immobileId: string; onSuccess?: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AttivaAssicurazioneFormInput, unknown, AttivaAssicurazioneInput>({
    resolver: zodResolver(attivaAssicurazioneSchema),
    defaultValues: { immobileId, tipo: "Polizza multirischio abitazione" },
  });

  async function onSubmit(data: AttivaAssicurazioneInput) {
    setServerError(null);
    const result = await attivaAssicurazioneAction(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("immobileId")} />
      <div>
        <Label htmlFor="tipo">Tipo di copertura</Label>
        <Input id="tipo" {...register("tipo")} />
        <FieldError message={errors.tipo?.message} />
      </div>
      <div>
        <Label htmlFor="premioAnnuale">Premio annuale (EUR)</Label>
        <Input id="premioAnnuale" type="number" min="0" step="1" {...register("premioAnnuale")} />
        <FieldError message={errors.premioAnnuale?.message} />
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Attivazione in corso..." : "Attiva copertura"}
      </Button>
    </form>
  );
}
