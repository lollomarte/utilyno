"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { RichiediGestioneForm } from "@/components/immobili/richiedi-gestione-form";

/** Ricorda l'ultimo immobileId non nullo: la Modal resta montata durante l'animazione di
 * chiusura (250ms), quindi il form non deve sparire nell'istante in cui il padre azzera l'id. */
export function RichiedeGestioneModal({ immobileId, onClose }: { immobileId: string | null; onClose: () => void }) {
  const [ultimoId, setUltimoId] = useState(immobileId);

  useEffect(() => {
    if (immobileId) setUltimoId(immobileId);
  }, [immobileId]);

  return (
    <Modal open={immobileId !== null} onClose={onClose} title="Cerca un'agenzia per la messa a rendita">
      {ultimoId && <RichiediGestioneForm key={ultimoId} immobileId={ultimoId} onSuccess={onClose} />}
    </Modal>
  );
}

/** Versione autonoma (stato aperto/chiuso gestito qui), per la dashboard per-immobile dove non
 * serve coordinarla con una lista esterna. */
export function RichiedeGestioneModalButton({ immobileId }: { immobileId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Cerca un&apos;agenzia
      </Button>
      <RichiedeGestioneModal immobileId={open ? immobileId : null} onClose={handleClose} />
    </>
  );
}
