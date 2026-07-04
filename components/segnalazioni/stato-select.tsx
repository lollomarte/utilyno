"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { aggiornaStatoSegnalazioneAction } from "@/app/actions/segnalazioni";
import { Select } from "@/components/ui/input";
import { STATO_SEGNALAZIONE_LABELS } from "@/lib/labels";
import type { StatoSegnalazione } from "@prisma/client";

export function StatoSegnalazioneSelect({ segnalazioneId, statoAttuale }: { segnalazioneId: string; statoAttuale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nuovoStato = e.target.value as StatoSegnalazione;
    startTransition(async () => {
      await aggiornaStatoSegnalazioneAction(segnalazioneId, nuovoStato);
      router.refresh();
    });
  }

  return (
    <Select defaultValue={statoAttuale} onChange={handleChange} disabled={isPending} className="w-auto">
      {Object.entries(STATO_SEGNALAZIONE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}
