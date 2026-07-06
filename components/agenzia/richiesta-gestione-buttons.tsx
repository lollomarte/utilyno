"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rispondiRichiestaGestioneAction } from "@/app/actions/immobili";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

export function RichiestaGestioneButtons({ richiestaId }: { richiestaId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function rispondi(accetta: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await withTimeout(rispondiRichiestaGestioneAction({ richiestaId, accetta }));
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch {
        setError("Qualcosa è andato storto, riprova.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button variant="secondary" disabled={isPending} onClick={() => rispondi(false)}>
          Rifiuta
        </Button>
        <Button disabled={isPending} onClick={() => rispondi(true)}>
          Accetta
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
