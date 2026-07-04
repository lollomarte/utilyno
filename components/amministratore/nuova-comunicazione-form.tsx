"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaComunicazioneAction } from "@/app/actions/condomini";
import { nuovaComunicazioneSchema, type NuovaComunicazioneInput } from "@/lib/validations/condominio";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NuovaComunicazioneForm({
  condominioId,
  condomini,
}: {
  /** Condominio fisso (usato nel dettaglio di un singolo condominio). */
  condominioId?: string;
  /** Se presente, mostra un selettore condominio invece di un valore fisso (vista aggregata Comunicazioni). */
  condomini?: { id: string; nome: string; comune: string }[];
}) {
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
    defaultValues: { condominioId: condominioId ?? "" },
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
    reset({ condominioId: condominioId ?? "", titolo: "", testo: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {condomini ? (
        <div>
          <Label htmlFor="condominioId">Condominio</Label>
          <Select id="condominioId" {...register("condominioId")}>
            <option value="">Seleziona...</option>
            {condomini.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} - {c.comune}
              </option>
            ))}
          </Select>
          <FieldError message={errors.condominioId?.message} />
        </div>
      ) : (
        <input type="hidden" {...register("condominioId")} />
      )}
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
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      {inviata && <p className="text-sm text-accent">Comunicazione inviata a tutto il condominio.</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Invio in corso..." : "Invia comunicazione a tutto il condominio"}
      </Button>
    </form>
  );
}
