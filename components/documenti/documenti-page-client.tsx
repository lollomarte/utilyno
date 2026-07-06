"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/table";
import { NuovoDocumentoForm, type ContestoOption } from "@/components/documenti/nuovo-documento-form";
import { DocumentiTable, type DocumentoRigaLista } from "@/components/documenti/documenti-table";

export function DocumentiPageClient({
  title,
  description,
  documenti,
  contesti,
}: {
  title: string;
  description: string;
  documenti: DocumentoRigaLista[];
  /** Omesso per i ruoli senza possibilità di upload (es. Admin: vista di sola consultazione). */
  contesti?: ContestoOption[];
}) {
  const [open, setOpen] = useState(false);
  const puoCaricare = contesti !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {puoCaricare && (
          <Button onClick={() => setOpen(true)} className="shrink-0">
            Nuovo documento
          </Button>
        )}
      </div>

      <Card className="p-0">
        {documenti.length === 0 ? (
          <EmptyState
            message="Nessun documento disponibile."
            action={puoCaricare ? <Button onClick={() => setOpen(true)}>Nuovo documento</Button> : undefined}
          />
        ) : (
          <DocumentiTable documenti={documenti} />
        )}
      </Card>

      {contesti && (
        <Modal open={open} onClose={() => setOpen(false)} title="Nuovo documento">
          {contesti.length === 0 ? (
            <p className="text-sm text-slate-500">Non hai ancora nulla a cui collegare un documento.</p>
          ) : (
            <NuovoDocumentoForm contesti={contesti} onSuccess={() => setOpen(false)} />
          )}
        </Modal>
      )}
    </div>
  );
}
