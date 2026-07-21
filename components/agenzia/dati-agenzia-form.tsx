"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aggiornaAgenziaAction } from "@/app/actions/profilo";
import {
  aggiornaAgenziaSchema,
  type AggiornaAgenziaInput,
  type AggiornaAgenziaFormInput,
} from "@/lib/validations/profilo";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { withTimeout } from "@/lib/utils";

export interface DatiAgenzia {
  ragioneSociale: string;
  piva: string;
  indirizzo: string;
  telefono: string | null;
  pec: string | null;
  codiceSdi: string | null;
  ibanAgenzia: string | null;
}

export function DatiAgenziaForm({ agenzia }: { agenzia: DatiAgenzia }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [salvato, setSalvato] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AggiornaAgenziaFormInput, unknown, AggiornaAgenziaInput>({
    resolver: zodResolver(aggiornaAgenziaSchema),
    defaultValues: {
      ragioneSociale: agenzia.ragioneSociale,
      piva: agenzia.piva,
      indirizzo: agenzia.indirizzo,
      telefono: agenzia.telefono ?? "",
      pec: agenzia.pec ?? "",
      codiceSdi: agenzia.codiceSdi ?? "",
      ibanAgenzia: agenzia.ibanAgenzia ?? "",
    },
  });

  async function onSubmit(data: AggiornaAgenziaInput) {
    setServerError(null);
    setSalvato(false);
    try {
      const result = await withTimeout(aggiornaAgenziaAction(data));
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
          <div className="sm:col-span-2">
            <Label htmlFor="ibanAgenzia">IBAN</Label>
            <Input id="ibanAgenzia" {...register("ibanAgenzia")} />
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
