"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { CONDIZIONE_IMMOBILE_LABELS, TIPO_RISCALDAMENTO_LABELS } from "@/lib/labels";

/**
 * Campi condivisi da ogni form di creazione/modifica Immobile (vedi immobileDatiAggiuntiviFields
 * in lib/validations/immobile.ts): dati non necessari all'uso attuale della piattaforma, ma che
 * evitano di doverli richiedere di nuovo a valle (passaggio in gestione ad agenzia, RLI,
 * quotazione assicurativa...). `register`/`errors` sono tipizzati `any` deliberatamente: questo è
 * un frammento presentazionale riusato da 5 form con tipi zod diversi ma con lo stesso
 * sottoinsieme di campi — la validazione forte resta nello zodResolver di ciascun form.
 */
export function DatiAggiuntiviImmobileFields({
  register,
}: {
  register: UseFormRegister<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}) {
  return (
    <CollapsibleSection
      title="Dati aggiuntivi (opzionali)"
      description="Non servono per l'uso attuale della piattaforma, ma evitano di doverli richiedere di nuovo più avanti (passaggio in gestione, RLI, assicurazione...)"
    >
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-subtle">Dati catastali</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="foglio">Foglio</Label>
            <Input id="foglio" {...register("foglio")} />
          </div>
          <div>
            <Label htmlFor="particella">Particella</Label>
            <Input id="particella" {...register("particella")} />
          </div>
          <div>
            <Label htmlFor="subalterno">Subalterno</Label>
            <Input id="subalterno" {...register("subalterno")} />
          </div>
          <div>
            <Label htmlFor="categoriaCatastale">Categoria</Label>
            <Input id="categoriaCatastale" placeholder="A/2" {...register("categoriaCatastale")} />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="renditaCatastale">Rendita catastale (EUR)</Label>
          <Input id="renditaCatastale" type="number" min="0" step="0.01" {...register("renditaCatastale")} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="apeScadenza">Scadenza APE</Label>
          <Input id="apeScadenza" type="date" {...register("apeScadenza")} />
        </div>
        <div>
          <Label htmlFor="numeroVani">Numero vani</Label>
          <Input id="numeroVani" type="number" min="0" step="1" {...register("numeroVani")} />
        </div>
        <div>
          <Label htmlFor="piano">Piano</Label>
          <Input id="piano" placeholder="3, T, S1..." {...register("piano")} />
        </div>
        <div>
          <Label htmlFor="annoCostruzione">Anno di costruzione</Label>
          <Input id="annoCostruzione" type="number" min="1800" step="1" {...register("annoCostruzione")} />
        </div>
        <div>
          <Label htmlFor="condizioneImmobile">Condizione</Label>
          <Select id="condizioneImmobile" defaultValue="" {...register("condizioneImmobile")}>
            <option value="">Non specificata</option>
            {Object.entries(CONDIZIONE_IMMOBILE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tipoRiscaldamento">Riscaldamento</Label>
          <Select id="tipoRiscaldamento" defaultValue="" {...register("tipoRiscaldamento")}>
            <option value="">Non specificato</option>
            {Object.entries(TIPO_RISCALDAMENTO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="dotazioni">Dotazioni (separate da virgola)</Label>
        <Input
          id="dotazioni"
          placeholder="Climatizzazione, cantina, box auto"
          {...register("dotazioni", {
            setValueAs: (v: unknown) =>
              typeof v === "string"
                ? v
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : v,
          })}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4" {...register("ascensore")} />
          Ascensore
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4" {...register("arredato")} />
          Arredato
        </label>
      </div>

      <div>
        <Label htmlFor="speseCondominialiMensili">Spese condominiali mensili (EUR)</Label>
        <Input id="speseCondominialiMensili" type="number" min="0" step="1" {...register("speseCondominialiMensili")} />
      </div>

      <div>
        <Label htmlFor="noteStima">Note per la stima del valore</Label>
        <Textarea id="noteStima" rows={2} {...register("noteStima")} />
      </div>
    </CollapsibleSection>
  );
}
