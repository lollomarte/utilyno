"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aggiornaPrivatoAction } from "@/app/actions/profilo";
import { aggiornaPrivatoSchema, type AggiornaPrivatoInput, type AggiornaPrivatoFormInput } from "@/lib/validations/profilo";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

export interface DatiPrivato {
  tipoSoggetto: "PERSONA_FISICA" | "AZIENDA";
  codiceFiscale: string | null;
  indirizzo: string | null;
  iban: string | null;
  ragioneSociale: string | null;
  piva: string | null;
  referenteNome: string | null;
  referenteRuolo: string | null;
}

export function DatiPrivatoForm({ privato }: { privato: DatiPrivato }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [salvato, setSalvato] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AggiornaPrivatoFormInput, unknown, AggiornaPrivatoInput>({
    resolver: zodResolver(aggiornaPrivatoSchema),
    defaultValues: {
      indirizzo: privato.indirizzo ?? "",
      iban: privato.iban ?? "",
      ragioneSociale: privato.ragioneSociale ?? "",
      piva: privato.piva ?? "",
      referenteNome: privato.referenteNome ?? "",
      referenteRuolo: privato.referenteRuolo ?? "",
    },
  });

  async function onSubmit(data: AggiornaPrivatoInput) {
    setServerError(null);
    setSalvato(false);
    try {
      const result = await withTimeout(aggiornaPrivatoAction(data));
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
        <Label htmlFor="codiceFiscale">{privato.tipoSoggetto === "AZIENDA" ? "Codice fiscale azienda" : "Codice fiscale"}</Label>
        <Input id="codiceFiscale" value={privato.codiceFiscale ?? ""} disabled />
      </div>

      {privato.tipoSoggetto === "AZIENDA" && (
        <div className="space-y-4 rounded-md bg-surface-muted p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Dati azienda</p>
          <div>
            <Label htmlFor="ragioneSociale">Ragione sociale</Label>
            <Input id="ragioneSociale" {...register("ragioneSociale")} />
          </div>
          <div>
            <Label htmlFor="piva">Partita IVA</Label>
            <Input id="piva" inputMode="numeric" {...register("piva")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="referenteNome">Nome del referente/firmatario</Label>
              <Input id="referenteNome" {...register("referenteNome")} />
            </div>
            <div>
              <Label htmlFor="referenteRuolo">Ruolo del referente</Label>
              <Input id="referenteRuolo" {...register("referenteRuolo")} />
            </div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="indirizzo">Indirizzo</Label>
        <Input id="indirizzo" {...register("indirizzo")} />
        <FieldError message={errors.indirizzo?.message} />
      </div>
      <div>
        <Label htmlFor="iban">IBAN per accredito canoni e depositi (opzionale)</Label>
        <Input id="iban" {...register("iban")} />
      </div>
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      {salvato && <p className="text-sm text-success">Dati aggiornati.</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
      </Button>
    </form>
  );
}
