"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aggiornaAmministratoreAction } from "@/app/actions/profilo";
import {
  aggiornaAmministratoreSchema,
  type AggiornaAmministratoreInput,
  type AggiornaAmministratoreFormInput,
} from "@/lib/validations/profilo";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { withTimeout } from "@/lib/utils";

export interface DatiAmministratore {
  ragioneSociale: string;
  piva: string;
  indirizzo: string;
  telefono: string | null;
  pec: string | null;
  codiceSdi: string | null;
}

export function DatiAmministratoreForm({ amministratore }: { amministratore: DatiAmministratore }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [salvato, setSalvato] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AggiornaAmministratoreFormInput, unknown, AggiornaAmministratoreInput>({
    resolver: zodResolver(aggiornaAmministratoreSchema),
    defaultValues: {
      ragioneSociale: amministratore.ragioneSociale,
      piva: amministratore.piva,
      indirizzo: amministratore.indirizzo,
      telefono: amministratore.telefono ?? "",
      pec: amministratore.pec ?? "",
      codiceSdi: amministratore.codiceSdi ?? "",
    },
  });

  async function onSubmit(data: AggiornaAmministratoreInput) {
    setServerError(null);
    setSalvato(false);
    try {
      const result = await withTimeout(aggiornaAmministratoreAction(data));
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ragioneSociale">Ragione sociale</Label>
          <Input id="ragioneSociale" {...register("ragioneSociale")} />
          <FieldError message={errors.ragioneSociale?.message} />
        </div>
        <div>
          <Label htmlFor="piva">Partita IVA</Label>
          <Input id="piva" inputMode="numeric" {...register("piva")} />
          <FieldError message={errors.piva?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="indirizzo">Indirizzo sede</Label>
          <Input id="indirizzo" {...register("indirizzo")} />
          <FieldError message={errors.indirizzo?.message} />
        </div>
        <div>
          <Label htmlFor="telefono">Telefono</Label>
          <Input id="telefono" {...register("telefono")} />
        </div>
      </div>

      <CollapsibleSection title="Dati aggiuntivi (opzionali)" description="Utili per fatturazione e comunicazioni formali">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pec">PEC</Label>
            <Input id="pec" type="email" {...register("pec")} />
          </div>
          <div>
            <Label htmlFor="codiceSdi">Codice destinatario SDI</Label>
            <Input id="codiceSdi" {...register("codiceSdi")} />
          </div>
        </div>
      </CollapsibleSection>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      {salvato && <p className="text-sm text-success">Dati aggiornati.</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
      </Button>
    </form>
  );
}
