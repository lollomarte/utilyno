"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaSegnalazioneAction } from "@/app/actions/condomini";
import { segnalazioneCondominialeSchema, type SegnalazioneCondominialeInput } from "@/lib/validations/condominio";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Condominio = { id: string; nome: string; comune: string };

export function NuovaSegnalazioneForm({ condomini }: { condomini: Condominio[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SegnalazioneCondominialeInput>({
    resolver: zodResolver(segnalazioneCondominialeSchema),
    defaultValues: { priorita: "MEDIA" },
  });

  async function onSubmit(data: SegnalazioneCondominialeInput) {
    setServerError(null);
    const result = await creaSegnalazioneAction(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    reset({ condominioId: data.condominioId, titolo: "", descrizione: "", priorita: "MEDIA" });
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
