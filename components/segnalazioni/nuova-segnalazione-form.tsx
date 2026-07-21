"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaSegnalazioneAction } from "@/app/actions/segnalazioni";
import {
  nuovaSegnalazioneSchema,
  FASCIA_ORARIA_OPTIONS,
  type NuovaSegnalazioneInput,
  type NuovaSegnalazioneFormInput,
} from "@/lib/validations/segnalazione";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { CATEGORIA_SEGNALAZIONE_LABELS, CATEGORIA_INTERVENTO_LABELS } from "@/lib/labels";
import { withTimeout } from "@/lib/utils";
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
  const [foto, setFoto] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NuovaSegnalazioneFormInput, unknown, NuovaSegnalazioneInput>({
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
    try {
      // Nessun upload reale: stesso mock (URL derivato dal nome file) già usato per le foto
      // della checklist ingresso/uscita, vedi app/actions/checklist.ts.
      const fotoUrls = foto.map((f) => `/segnalazioni/mock/${f.name}`);
      const result = await withTimeout(creaSegnalazioneAction({ ...data, fotoUrls }));
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      reset({
        immobileId: data.immobileId,
        titolo: "",
        descrizione: "",
        priorita: "MEDIA",
        categoria: undefined,
        categoriaIntervento: undefined,
        fasciaOrariaDisponibile: undefined,
      });
      setFoto([]);
      router.refresh();
      setEsito(result.destinatari);
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  if (esito) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-ink">Segnalazione inviata.</p>
        {esito.length > 0 ? (
          <div className="rounded-control bg-success-soft p-4 text-sm text-slate-700">
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
        <Label htmlFor="categoriaIntervento">Tipo di intervento necessario (opzionale)</Label>
        <Select id="categoriaIntervento" {...register("categoriaIntervento")}>
          <option value="">Non specificato</option>
          {Object.entries(CATEGORIA_INTERVENTO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-slate-400">
          Se indicato, potrai richiedere un preventivo a un partner convenzionato dopo l&apos;invio.
        </p>
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

      <CollapsibleSection title="Dati aggiuntivi (opzionali)" description="Aiutano chi deve intervenire a organizzarsi">
        <div>
          <Label htmlFor="foto">Foto allegate</Label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFoto(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
        </div>
        <div>
          <Label htmlFor="fasciaOrariaDisponibile">Fascia oraria disponibile per l&apos;intervento</Label>
          <Select id="fasciaOrariaDisponibile" {...register("fasciaOrariaDisponibile")}>
            <option value="">Non specificata</option>
            {FASCIA_ORARIA_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </div>
      </CollapsibleSection>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting || !immobileId}>
        {isSubmitting ? "Invio in corso..." : "Crea segnalazione"}
      </Button>
    </form>
  );
}
