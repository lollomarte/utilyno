"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { NuovaNotaSviluppatoreForm } from "@/components/note-sviluppatore/nuova-nota-sviluppatore-form";
import { NoteSviluppatoreList, type NotaSviluppatoreRiga } from "@/components/note-sviluppatore/note-sviluppatore-list";

export function NoteSviluppatorePageClient({ note }: { note: NotaSviluppatoreRiga[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Note per lo sviluppatore</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bacheca condivisa tra tutti i portali: scrivi un bug o un suggerimento, tutti possono leggerlo.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          Nuova nota
        </Button>
      </div>

      <Card>
        <NoteSviluppatoreList note={note} />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuova nota per lo sviluppatore">
        <NuovaNotaSviluppatoreForm onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
