"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaSegnalazioneAction } from "@/app/actions/condomini";
import {
  segnalazioneCondominialeSchema,
  type SegnalazioneCondominialeInput,
  type SegnalazioneCondominialeFormInput,
} from "@/lib/validations/condominio";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Condominio = { id: string; nome: string; comune: string };
type Immobile = { id: string; indirizzo: string; condominioId: string | null; contratti: { id: string }[] };

export function NuovaSegnalazioneForm({ condomini, immobili }: { condomini: Condominio[]; immobili: Immobile[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SegnalazioneCondominialeFormInput, unknown, SegnalazioneCondominialeInput>({
    resolver: zodResolver(segnalazioneCondominialeSchema),
    defaultValues: { priorita: "MEDIA", destinatario: "INQUILINO" },
  });

  const condominioId = watch("condominioId");
  const immobileId = watch("immobileId");
  const destinatario = watch("destinatario");
  const immobiliDelCondominio = immobili.filter((i) => i.condominioId === condominioId);
  const immobileSelezionato = immobiliDelCondominio.find((i) => i.id === immobileId);
  const haInquilinoAttivo = (immobileSelezionato?.contratti.length ?? 0) > 0;

  useEffect(() => {
    if (immobileId && !haInquilinoAttivo && destinatario !== "PROPRIETARIO") {
      setValue("destinatario", "PROPRIETARIO");
    }
  }, [immobileId, haInquilinoAttivo, destinatario, setValue]);

  useEffect(() => {
    if (immobileId && !immobiliDelCondominio.some((i) => i.id === immobileId)) {
      setValue("immobileId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condominioId]);

  async function onSubmit(data: SegnalazioneCondominialeInput) {
    setServerError(null);
    const result = await creaSegnalazioneAction(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    reset({ condominioId: data.condominioId, titolo: "", descrizione: "", priorita: "MEDIA", destinatario: "INQUILINO", immobileId: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
      <div>
        <Label htmlFor="immobileId">Unità immobiliare (opzionale)</Label>
        <Select id="immobileId" disabled={!condominioId} {...register("immobileId")}>
          <option value="">Segnalazione generale (nessuna unità specifica)</option>
          {immobiliDelCondominio.map((i) => (
            <option key={i.id} value={i.id}>
              {i.indirizzo}
            </option>
          ))}
        </Select>
      </div>
      {immobileId && (
        <div className="rounded-md bg-slate-50 p-4">
          <Label htmlFor="destinatario">Destinatari</Label>
          <Select id="destinatario" {...register("destinatario")}>
            <option value="INQUILINO" disabled={!haInquilinoAttivo}>
              Solo Inquilino
            </option>
            <option value="PROPRIETARIO">Solo Proprietario</option>
            <option value="ENTRAMBI" disabled={!haInquilinoAttivo}>
              Entrambi
            </option>
          </Select>
          {!haInquilinoAttivo && (
            <p className="mt-1 text-xs text-amber-600">Questa unità non ha un inquilino attivo: solo il proprietario potrà essere avvisato.</p>
          )}
        </div>
      )}
      <div>
        <Label htmlFor="titolo">Titolo</Label>
        <Input id="titolo" {...register("titolo")} />
        <FieldError message={errors.titolo?.message} />
      </div>
      <div>
        <Label htmlFor="descrizione">Descrizione</Label>
        <Textarea id="descrizione" rows={3} {...register("descrizione")} />
        <FieldError message={errors.descrizione?.message} />
      </div>
      <div>
        <Label htmlFor="priorita">Priorità</Label>
        <Select id="priorita" {...register("priorita")}>
          <option value="BASSA">Bassa</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
        </Select>
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Invio in corso..." : "Crea segnalazione"}
      </Button>
    </form>
  );
}
