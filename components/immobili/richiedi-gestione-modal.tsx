"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
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
