"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/table";
import { NuovaSegnalazioneForm } from "@/components/segnalazioni/nuova-segnalazione-form";
import { SegnalazioniTable, type SegnalazioneRigaLista } from "@/components/segnalazioni/segnalazioni-table";

type ImmobileOption = { id: string; indirizzo: string; comune: string; condominioId: string | null };

export function SegnalazioniPageClient({
  title,
  description,
  segnalazioni,
  immobili,
  basePath,
}: {
  title: string;
  description: string;
  segnalazioni: SegnalazioneRigaLista[];
  immobili: ImmobileOption[];
  basePath: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          Nuova segnalazione
        </Button>
      </div>

      <Card className="p-0">
        {segnalazioni.length === 0 ? (
          <EmptyState
            message="Nessuna segnalazione al momento."
            action={<Button onClick={() => setOpen(true)}>Nuova segnalazione</Button>}
          />
        ) : (
          <SegnalazioniTable segnalazioni={segnalazioni} basePath={basePath} />
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuova segnalazione">
        <NuovaSegnalazioneForm immobili={immobili} onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
