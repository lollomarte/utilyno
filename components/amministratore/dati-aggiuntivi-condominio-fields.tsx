"use client";

import type { UseFormRegister } from "react-hook-form";
import { Input, Label } from "@/components/ui/input";
import { CollapsibleSection } from "@/components/ui/collapsible-section";

/**
 * Campi condivisi da creazione e modifica di un Condominio (vedi condominioDatiAggiuntiviFields
 * in lib/validations/condominio.ts). `register` è tipizzato `any` deliberatamente: frammento
 * presentazionale riusato da 2 form con tipi zod diversi ma con lo stesso sottoinsieme di campi.
 */
export function DatiAggiuntiviCondominioFields({
  register,
}: {
  register: UseFormRegister<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}) {
  return (
    <CollapsibleSection
      title="Dati aggiuntivi (opzionali)"
      description="Utili per la polizza globale fabbricato e la gestione del condominio"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="codiceFiscale">Codice fiscale condominio</Label>
          <Input id="codiceFiscale" {...register("codiceFiscale")} />
        </div>
        <div>
          <Label htmlFor="ibanCondominio">IBAN condominio</Label>
          <Input id="ibanCondominio" {...register("ibanCondominio")} />
        </div>
        <div>
          <Label htmlFor="annoCostruzione">Anno di costruzione</Label>
          <Input id="annoCostruzione" type="number" min="1800" step="1" {...register("annoCostruzione")} />
        </div>
        <div>
          <Label htmlFor="impiantiComuni">Impianti comuni (separati da virgola)</Label>
          <Input
            id="impiantiComuni"
            placeholder="Autoclave, cancello automatico"
            {...register("impiantiComuni", {
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
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4" {...register("ascensore")} />
        Ascensore
      </label>
    </CollapsibleSection>
  );
}
