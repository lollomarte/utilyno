"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redimiInvitoInquilinoAction } from "@/app/actions/inviti";
import { redimiInvitoSchema, type RedimiInvitoInput } from "@/lib/validations/invito";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { NuovoImmobileProprietarioForm } from "@/components/immobili/nuovo-immobile-proprietario-form";
import { cn, withTimeout } from "@/lib/utils";

/**
 * Bottone sempre visibile nella lista "I miei immobili": la scelta proprietario/inquilino è
 * per-immobile (non più per-account), quindi va fatta qui, ogni volta che si aggiunge un
 * immobile, non una tantum in fase di registrazione.
 */
export function AggiungiImmobileButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"proprietario" | "inquilino">("proprietario");

  function handleClose() {
    setOpen(false);
    setTab("proprietario");
  }

  function handleSuccess(immobileId: string) {
    handleClose();
    router.push(`/privato/${immobileId}`);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="shrink-0">
        Aggiungi immobile
      </Button>

      <Modal open={open} onClose={handleClose} title="Aggiungi immobile">
        <div className="mb-4 flex gap-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab("proprietario")}
            className={cn(
              "border-b-2 px-1 pb-2 text-sm font-medium",
              tab === "proprietario" ? "border-primary text-ink" : "border-transparent text-slate-500"
            )}
          >
            Come proprietario
          </button>
          <button
            type="button"
            onClick={() => setTab("inquilino")}
            className={cn(
              "border-b-2 px-1 pb-2 text-sm font-medium",
              tab === "inquilino" ? "border-primary text-ink" : "border-transparent text-slate-500"
            )}
          >
            Come inquilino
          </button>
        </div>

        {tab === "proprietario" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Inserisci i dati del tuo immobile: resterà in attesa di validazione finché non lo colleghi a un&apos;agenzia.
            </p>
            <NuovoImmobileProprietarioForm onSuccess={(immobile) => handleSuccess(immobile.id)} />
          </div>
        ) : (
          <CollegaInvitoForm onSuccess={handleSuccess} />
        )}
      </Modal>
    </>
  );
}

function CollegaInvitoForm({ onSuccess }: { onSuccess: (immobileId: string) => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RedimiInvitoInput>({ resolver: zodResolver(redimiInvitoSchema) });

  async function onSubmit(data: RedimiInvitoInput) {
    setServerError(null);
    try {
      const result = await withTimeout(redimiInvitoInquilinoAction(data));
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      onSuccess(result.immobileId);
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-slate-500">
        Inserisci il codice di invito ricevuto dall&apos;agenzia o dal proprietario per collegare il tuo contratto di
        locazione al tuo account.
      </p>
      <div>
        <Label htmlFor="token">Codice di invito</Label>
        <Input id="token" {...register("token")} />
        <FieldError message={errors.token?.message} />
      </div>
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Verifica in corso..." : "Collega immobile"}
      </Button>
    </form>
  );
}
