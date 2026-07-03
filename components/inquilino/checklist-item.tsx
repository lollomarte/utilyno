"use client";

import { useState, useTransition } from "react";
import { firmaChecklistInquilinoAction } from "@/app/actions/checklist";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { TIPO_CHECKLIST_LABELS } from "@/lib/labels";
import type { TipoChecklist } from "@prisma/client";

export function ChecklistItem({
  id,
  tipo,
  note,
  fotoCount,
  dataCompilazione,
  firmaInquilinoAt,
  firmaProprietarioAt,
}: {
  id: string;
  tipo: TipoChecklist;
  note: string | null;
  fotoCount: number;
  dataCompilazione: Date;
  firmaInquilinoAt: Date | null;
  firmaProprietarioAt: Date | null;
}) {
  const [firmata, setFirmata] = useState(firmaInquilinoAt);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFirma() {
    setError(null);
    startTransition(async () => {
      const result = await firmaChecklistInquilinoAction(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setFirmata(new Date());
    });
  }

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-900">
          {TIPO_CHECKLIST_LABELS[tipo]} &middot; {fotoCount} foto
        </span>
        <span className="text-xs text-slate-400">{formatDate(dataCompilazione)}</span>
      </div>
      {note && <p className="mt-1 text-sm text-slate-500">{note}</p>}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Firma proprietario: {firmaProprietarioAt ? `confermata il ${formatDate(firmaProprietarioAt)}` : "da confermare"}
        </p>
        {firmata ? (
          <p className="text-xs text-emerald-700">Firmata da te il {formatDate(firmata)}</p>
        ) : (
          <Button type="button" variant="secondary" onClick={handleFirma} disabled={isPending}>
            {isPending ? "..." : "Firma checklist"}
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </li>
  );
}
