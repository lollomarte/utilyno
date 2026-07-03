"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaComunicazioneAction } from "@/app/actions/condomini";
import { nuovaComunicazioneSchema, type NuovaComunicazioneInput } from "@/lib/validations/condominio";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NuovaComunicazioneForm({ condominioId }: { condominioId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [inviata, setInviata] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NuovaComunicazioneInput>({
    resolver: zodResolver(nuovaComunicazioneSchema),
    defaultValues: { condominioId },
  });

  async function onSubmit(data: NuovaComunicazioneInput) {
    setServerError(null);
    setInviata(false);
    const result = await creaComunicazioneAction(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setInviata(true);
    reset({ condominioId, titolo: "", testo: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("condominioId")} />
      <div>
        <Label htmlFor="titolo">Titolo</Label>
        <Input id="titolo" {...register("titolo")} />
        <FieldError message={errors.titolo?.message} />
      </div>
      <div>
        <Label htmlFor="testo">Testo</Label>
        <Textarea id="testo" rows={4} {...register("testo")} />
        <FieldError message={errors.testo?.message} />
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {inviata && <p className="text-sm text-emerald-700">Comunicazione inviata a tutto il condominio.</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Invio in corso..." : "Invia comunicazione a tutto il condominio"}
      </Button>
    </form>
  );
}
