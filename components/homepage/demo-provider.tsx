"use client";

import { createContext, useContext, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { DemoForm } from "@/components/homepage/demo-form";

const DemoModalContext = createContext<(() => void) | null>(null);

/** Un solo modale di richiesta demo condiviso da header, hero, CTA finale e footer. */
export function DemoModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <DemoModalContext.Provider value={() => setOpen(true)}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} title="Richiedi una demo">
        <DemoForm onSuccess={() => setOpen(false)} />
      </Modal>
    </DemoModalContext.Provider>
  );
}

export function useDemoModal() {
  const ctx = useContext(DemoModalContext);
  if (!ctx) throw new Error("useDemoModal deve essere usato dentro DemoModalProvider");
  return ctx;
}
