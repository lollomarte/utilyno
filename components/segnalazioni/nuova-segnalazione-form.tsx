"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaSegnalazioneAction } from "@/app/actions/segnalazioni";
import { nuovaSegnalazioneSchema, type NuovaSegnalazioneInput } from "@/lib/validations/segnalazione";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIA_SEGNALAZIONE_LABELS } from "@/lib/labels";
import type { CategoriaSegnalazione } from "@prisma/client";

type ImmobileOption = { id: string; indirizzo: string; comune: string; condominioId: string | null };

const CATEGORIE_BASE: CategoriaSegnalazione[] = ["PROBLEMA_UNITA", "PROBLEMA_MISTO", "PROBLEMA_CONTRATTUALE"];

export function NuovaSegnalazioneForm({
  immobili,
  onSuccess,
}: {
  immobili: ImmobileOption[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [esito, setEsito] = useState<{ nome: string; cognome: string; ruolo: string }[] | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NuovaSegnalazioneInput>({
    resolver: zodResolver(nuovaSegnalazioneSchema),
    defaultValues: { immobileId: immobili[0]?.id ?? "", priorita: "MEDIA" },
  });

  const immobileId = watch("immobileId");
  const immobileSelezionato = immobili.find((i) => i.id === immobileId);

  const categorieDisponibili = useMemo(() => {
    const categorie = [...CATEGORIE_BASE];
    if (immobileSelezionato?.condominioId) categorie.splice(1, 0, "PROBLEMA_CONDOMINIALE");
    return categorie;
  }, [immobileSelezionato]);

  async function onSubmit(data: NuovaSegnalazioneInput) {
    setServerError(null);
    const result = await creaSegnalazioneAction(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    reset({ immobileId: data.immobileId, titolo: "", descrizione: "", priorita: "MEDIA", categoria: undefined });
    router.refresh();
    setEsito(result.destinatari);
  }

  if (esito) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-900">Segnalazione inviata.</p>
        {esito.length > 0 ? (
          <div className="rounded-control bg-accent-soft p-4 text-sm text-slate-700">
            <p className="font-medium">Inviata a:</p>
            <ul className="mt-1 space-y-0.5">
              {esito.map((d, i) => (
                <li key={i}>
                  {d.nome} {d.cognome} ({d.ruolo})
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Nessun altro destinatario trovato per questo immobile: la segnalazione resta visibile solo a te.
          </p>
        )}
        <Button
          type="button"
          onClick={() => {
            setEsito(null);
            onSuccess?.();
          }}
        >
          Chiudi
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {immobili.length > 1 && (
        <div>
          <Label htmlFor="immobileId">Immobile</Label>
          <Select id="immobileId" {...register("immobileId")}>
            {immobili.map((i) => (
              <option key={i.id} value={i.id}>
                {i.indirizzo}, {i.comune}
              </option>
            ))}
          </Select>
          <FieldError message={errors.immobileId?.message} />
        </div>
      )}
      <div>
        <Label htmlFor="categoria">Categoria</Label>
        <Select id="categoria" {...register("categoria")}>
          {categorieDisponibili.map((c) => (
            <option key={c} value={c}>
              {CATEGORIA_SEGNALAZIONE_LABELS[c]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="titolo">Titolo</Label>
        <Input id="titolo" {...register("titolo")} />
        <FieldError message={errors.titolo?.message} />
      </div>
      <div>
        <Label htmlFor="descrizione">Descrizione</Label>
        <Textarea id="descrizione" rows={4} {...register("descrizione")} />
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
      <Button type="submit" disabled={isSubmitting || !immobileId}>
        {isSubmitting ? "Invio in corso..." : "Crea segnalazione"}
      </Button>
    </form>
  );
}
