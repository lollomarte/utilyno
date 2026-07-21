"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaNotaSviluppatoreAction } from "@/app/actions/note-sviluppatore";
import { nuovaNotaSviluppatoreSchema, type NuovaNotaSviluppatoreInput } from "@/lib/validations/nota-sviluppatore";
import { Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

export function NuovaNotaSviluppatoreForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NuovaNotaSviluppatoreInput>({
    resolver: zodResolver(nuovaNotaSviluppatoreSchema),
    defaultValues: { tipo: "SUGGERIMENTO", testo: "" },
  });

  async function onSubmit(data: NuovaNotaSviluppatoreInput) {
    setServerError(null);
    try {
      const result = await withTimeout(creaNotaSviluppatoreAction(data));
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      reset({ tipo: "SUGGERIMENTO", testo: "" });
      router.refresh();
      onSuccess?.();
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="tipo">Tipo</Label>
        <Select id="tipo" {...register("tipo")}>
          <option value="SUGGERIMENTO">Suggerimento</option>
          <option value="BUG">Segnalazione di un problema</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="testo">Nota per lo sviluppatore</Label>
        <Textarea id="testo" rows={5} placeholder="Cosa vorresti segnalare o suggerire?" {...register("testo")} />
        <FieldError message={errors.testo?.message} />
      </div>
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Invio in corso..." : "Invia nota"}
      </Button>
    </form>
  );
}
