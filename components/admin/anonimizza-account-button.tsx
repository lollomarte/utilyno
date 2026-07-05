"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { anonimizzaAccountAction } from "@/app/actions/account";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

export function AnonimizzaAccountButton({ userId, email }: { userId: string; email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatto, setFatto] = useState(false);

  async function handleConferma() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await withTimeout(anonimizzaAccountAction(userId));
      if (!result.success) {
        setError(result.error);
        return;
      }
      setFatto(true);
      router.refresh();
    } catch {
      setError("Qualcosa è andato storto, riprova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button type="button" variant="danger" onClick={() => setOpen(true)}>
        Anonimizza account
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Anonimizza account">
        {fatto ? (
          <p className="text-sm text-slate-600">
            Account anonimizzato. Nome, cognome, email e telefono sono stati sostituiti con placeholder; contratti,
            pagamenti e log restano intatti. L&apos;utente non potrà più accedere.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Stai per anonimizzare l&apos;account <strong>{email}</strong>. Nome, cognome, email, telefono e codice
              fiscale verranno sostituiti con placeholder in modo permanente; contratti, pagamenti e cronologia
              restano collegati ma non più riconducibili a questa persona. L&apos;azione non è reversibile.
            </p>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Annulla
              </Button>
              <Button type="button" variant="danger" onClick={handleConferma} disabled={isSubmitting}>
                {isSubmitting ? "Anonimizzazione..." : "Conferma anonimizzazione"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
