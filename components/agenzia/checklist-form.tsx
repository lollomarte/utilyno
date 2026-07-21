"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { creaChecklistAction } from "@/app/actions/checklist";
import { TIPO_CHECKLIST_LABELS } from "@/lib/labels";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { withTimeout } from "@/lib/utils";

export function ChecklistForm({ contrattoId }: { contrattoId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await withTimeout(creaChecklistAction(formData));
        if (!result.success) {
          setError(result.error);
          return;
        }
        setSuccess(true);
        formRef.current?.reset();
        router.refresh();
      } catch {
        setError("Qualcosa è andato storto, riprova.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="contrattoId" value={contrattoId} />
      <div>
        <Label htmlFor="tipo">Tipo checklist</Label>
        <Select id="tipo" name="tipo" defaultValue="INGRESSO">
          {Object.entries(TIPO_CHECKLIST_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="foto">Foto (opzionale)</Label>
        <input
          id="foto"
          name="foto"
          type="file"
          accept="image/*"
          multiple
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
      </div>
      <div>
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" name="note" rows={3} />
      </div>

      <CollapsibleSection title="Letture contatori (opzionali)" description="Utili per voltura utenze e contestazioni consumi">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="letturaLuce">Luce (kWh)</Label>
            <Input id="letturaLuce" name="letturaLuce" type="number" min="0" step="0.01" />
          </div>
          <div>
            <Label htmlFor="letturaGas">Gas (mc)</Label>
            <Input id="letturaGas" name="letturaGas" type="number" min="0" step="0.01" />
          </div>
          <div>
            <Label htmlFor="letturaAcqua">Acqua (mc)</Label>
            <Input id="letturaAcqua" name="letturaAcqua" type="number" min="0" step="0.01" />
          </div>
        </div>
      </CollapsibleSection>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="firmaProprietario" className="h-4 w-4" />
        Firma proprietario confermata (presente al momento della compilazione)
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">Checklist salvata.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvataggio in corso..." : "Salva checklist"}
      </Button>
    </form>
  );
}
