"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aggiornaProprietarioAction } from "@/app/actions/profilo";
import {
  aggiornaProprietarioSchema,
  type AggiornaProprietarioInput,
  type AggiornaProprietarioFormInput,
} from "@/lib/validations/profilo";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

export interface DatiProprietario {
  codiceFiscale: string;
  indirizzo: string;
  ibanProprietario: string | null;
}

export function DatiProprietarioForm({ proprietario }: { proprietario: DatiProprietario }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [salvato, setSalvato] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AggiornaProprietarioFormInput, unknown, AggiornaProprietarioInput>({
    resolver: zodResolver(aggiornaProprietarioSchema),
    defaultValues: {
      indirizzo: proprietario.indirizzo,
      ibanProprietario: proprietario.ibanProprietario ?? "",
    },
  });

  async function onSubmit(data: AggiornaProprietarioInput) {
    setServerError(null);
    setSalvato(false);
    try {
      const result = await withTimeout(aggiornaProprietarioAction(data));
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      setSalvato(true);
      router.refresh();
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="codiceFiscale">Codice fiscale</Label>
        <Input id="codiceFiscale" value={proprietario.codiceFiscale} disabled />
      </div>
      <div>
        <Label htmlFor="indirizzo">Indirizzo</Label>
        <Input id="indirizzo" {...register("indirizzo")} />
        <FieldError message={errors.indirizzo?.message} />
      </div>
      <div>
        <Label htmlFor="ibanProprietario">IBAN per accredito canoni e depositi (opzionale)</Label>
        <Input id="ibanProprietario" {...register("ibanProprietario")} />
      </div>
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      {salvato && <p className="text-sm text-success">Dati aggiornati.</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
      </Button>
    </form>
  );
}
