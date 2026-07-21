"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/labels";
import { toggleNotaSviluppatoreRisoltaAction } from "@/app/actions/note-sviluppatore";
import type { TipoNotaSviluppatore } from "@prisma/client";

export interface NotaSviluppatoreRiga {
  id: string;
  testo: string;
  tipo: TipoNotaSviluppatore;
  risolta: boolean;
  createdAt: Date;
  autore: { nome: string; cognome: string; role: string };
}

function NotaCard({ nota }: { nota: NotaSviluppatoreRiga }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleRisolta() {
    startTransition(async () => {
      await toggleNotaSviluppatoreRisoltaAction(nota.id, !nota.risolta);
      router.refresh();
    });
  }

  return (
    <li className={`rounded-control border border-border p-4 ${nota.risolta ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge tone={nota.tipo === "BUG" ? "danger" : "info"}>{nota.tipo === "BUG" ? "Problema" : "Suggerimento"}</Badge>
          {nota.risolta && <Badge tone="success">Gestita</Badge>}
        </div>
        <span className="text-xs text-ink-subtle">{formatDateTime(nota.createdAt)}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{nota.testo}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-ink-subtle">
          {nota.autore.nome} {nota.autore.cognome} · {ROLE_LABELS[nota.autore.role] ?? nota.autore.role}
        </span>
        <Button type="button" variant="ghost" className="!px-2 !py-1 text-xs" disabled={isPending} onClick={toggleRisolta}>
          {nota.risolta ? "Riapri" : "Segna come gestita"}
        </Button>
      </div>
    </li>
  );
}

export function NoteSviluppatoreList({ note }: { note: NotaSviluppatoreRiga[] }) {
  if (note.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-ink-subtle">Nessuna nota per lo sviluppatore al momento.</p>;
  }

  return (
    <ul className="space-y-3">
      {note.map((nota) => (
        <NotaCard key={nota.id} nota={nota} />
      ))}
    </ul>
  );
}
