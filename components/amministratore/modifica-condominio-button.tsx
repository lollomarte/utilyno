"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aggiornaCondominioAction } from "@/app/actions/condomini";
import {
  aggiornaCondominioSchema,
  type AggiornaCondominioInput,
  type AggiornaCondominioFormInput,
} from "@/lib/validations/condominio";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DatiAggiuntiviCondominioFields } from "@/components/amministratore/dati-aggiuntivi-condominio-fields";
import { withTimeout } from "@/lib/utils";

export interface CondominioDaModificare {
  id: string;
  nome: string;
  indirizzo: string;
  comune: string;
  numeroUnita: number;
  codiceFiscale: string | null;
  ibanCondominio: string | null;
  annoCostruzione: number | null;
  ascensore: boolean | null;
  impiantiComuni: string[];
}

export function ModificaCondominioButton({ condominio }: { condominio: CondominioDaModificare }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Modifica dati condominio
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifica dati condominio">
        <ModificaCondominioForm condominio={condominio} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function ModificaCondominioForm({ condominio, onSuccess }: { condominio: CondominioDaModificare; onSuccess?: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AggiornaCondominioFormInput, unknown, AggiornaCondominioInput>({
    resolver: zodResolver(aggiornaCondominioSchema),
    defaultValues: {
      condominioId: condominio.id,
      nome: condominio.nome,
      indirizzo: condominio.indirizzo,
      comune: condominio.comune,
      numeroUnita: condominio.numeroUnita,
      codiceFiscale: condominio.codiceFiscale ?? "",
      ibanCondominio: condominio.ibanCondominio ?? "",
      annoCostruzione: condominio.annoCostruzione ?? undefined,
      ascensore: condominio.ascensore ?? false,
      impiantiComuni: condominio.impiantiComuni.join(", ") as unknown as string[],
    },
  });

  async function onSubmit(data: AggiornaCondominioInput) {
    setServerError(null);
    try {
      const result = await withTimeout(aggiornaCondominioAction(data));
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
      <input type="hidden" {...register("condominioId")} />
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
        {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
      </Button>
    </form>
  );
}
