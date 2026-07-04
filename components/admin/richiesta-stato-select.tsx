"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { aggiornaStatoRichiestaPreventivoAction } from "@/app/actions/partner";
import { Select } from "@/components/ui/input";
import { STATO_RICHIESTA_PREVENTIVO_LABELS } from "@/lib/labels";
import type { StatoRichiestaPreventivo } from "@prisma/client";

export function RichiestaStatoSelect({ richiestaId, statoAttuale }: { richiestaId: string; statoAttuale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nuovoStato = e.target.value as StatoRichiestaPreventivo;
    startTransition(async () => {
      await aggiornaStatoRichiestaPreventivoAction(richiestaId, nuovoStato);
      router.refresh();
    });
  }

  return (
    <Select defaultValue={statoAttuale} onChange={handleChange} disabled={isPending} className="w-auto">
      {Object.entries(STATO_RICHIESTA_PREVENTIVO_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}
