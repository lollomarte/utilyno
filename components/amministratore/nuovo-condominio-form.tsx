"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaCondominioAction } from "@/app/actions/condomini";
import { nuovoCondominioSchema, type NuovoCondominioInput, type NuovoCondominioFormInput } from "@/lib/validations/condominio";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatiAggiuntiviCondominioFields } from "@/components/amministratore/dati-aggiuntivi-condominio-fields";
import { withTimeout } from "@/lib/utils";

export function NuovoCondominioForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NuovoCondominioFormInput, unknown, NuovoCondominioInput>({ resolver: zodResolver(nuovoCondominioSchema) });

  async function onSubmit(data: NuovoCondominioInput) {
    setServerError(null);
    try {
      const result = await withTimeout(creaCondominioAction(data));
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      router.push(`/amministratore/condomini/${result.condominioId}`);
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome condominio</Label>
        <Input id="nome" {...register("nome")} />
        <FieldError message={errors.nome?.message} />
      </div>
      <div>
        <Label htmlFor="indirizzo">Indirizzo</Label>
        <Input id="indirizzo" {...register("indirizzo")} />
        <FieldError message={errors.indirizzo?.message} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="comune">Comune</Label>
          <Input id="comune" {...register("comune")} />
          <FieldError message={errors.comune?.message} />
        </div>
        <div>
          <Label htmlFor="numeroUnita">Numero unità</Label>
          <Input id="numeroUnita" type="number" min="1" step="1" {...register("numeroUnita")} />
          <FieldError message={errors.numeroUnita?.message} />
        </div>
      </div>

      <DatiAggiuntiviCondominioFields register={register} />

      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creazione in corso..." : "Crea condominio"}
      </Button>
    </form>
  );
}
