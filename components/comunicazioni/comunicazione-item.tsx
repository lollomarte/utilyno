"use client";

import { useState, useTransition } from "react";
import { segnaComunicazioneLettaAction } from "@/app/actions/comunicazioni";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function ComunicazioneItem({
  id,
  titolo,
  testo,
  createdAt,
  letta: lettaIniziale,
}: {
  id: string;
  titolo: string;
  testo: string;
  createdAt: Date;
  letta: boolean;
}) {
  const [letta, setLetta] = useState(lettaIniziale);
  const [isPending, startTransition] = useTransition();

  function handleMarkRead() {
    startTransition(async () => {
      const result = await segnaComunicazioneLettaAction(id);
      if (result.success) setLetta(true);
    });
  }

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-ink">{titolo}</span>
        {letta ? <Badge tone="neutral">Letta</Badge> : <Badge tone="info">Nuova</Badge>}
      </div>
      <p className="mt-1 text-sm text-slate-500">{testo}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-400">{formatDate(createdAt)}</p>
        {!letta && (
          <button
            type="button"
            onClick={handleMarkRead}
            disabled={isPending}
            className="text-xs font-medium text-slate-600 underline hover:text-ink disabled:text-slate-400"
          >
            {isPending ? "..." : "Segna come letta"}
          </button>
        )}
      </div>
    </li>
  );
}
