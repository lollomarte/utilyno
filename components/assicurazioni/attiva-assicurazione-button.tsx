"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AttivaAssicurazioneForm } from "@/components/assicurazioni/attiva-assicurazione-form";

export function AttivaAssicurazioneButton({
  immobileId,
  fornitoriDisponibili,
}: {
  immobileId: string;
  fornitoriDisponibili: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Attiva copertura assicurativa
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Attiva copertura assicurativa">
        <AttivaAssicurazioneForm
          immobileId={immobileId}
          fornitoriDisponibili={fornitoriDisponibili}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
