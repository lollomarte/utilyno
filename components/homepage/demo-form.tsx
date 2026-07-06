"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DemoFormValues {
  nome: string;
  email: string;
  azienda: string;
  messaggio: string;
}

/**
 * Non esiste ancora un CRM dietro (vedi nota storica nella pagina): il
 * submit è simulato, ma micro-feedback per campo, stato di invio e
 * conferma sono reali — è l'esperienza che avrà il form vero.
 */
export function DemoForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemoFormValues>();
  const [sent, setSent] = useState(false);

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-fade-in-up space-y-4 py-2 text-center">
        <p className="font-display text-lg font-semibold text-ink">Richiesta inviata.</p>
        <p className="text-sm text-ink-muted">Ti contatteremo a breve per organizzare la demo.</p>
        <Button type="button" onClick={onSuccess} className="w-full">
          Chiudi
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="demo-nome">Nome</Label>
        <Input id="demo-nome" autoComplete="name" {...register("nome", { required: "Il nome è obbligatorio" })} />
        <FieldError message={errors.nome?.message} />
      </div>
      <div>
        <Label htmlFor="demo-email">Email</Label>
        <Input
          id="demo-email"
          type="email"
          autoComplete="email"
          {...register("email", { required: "L'email è obbligatoria" })}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="demo-azienda">Agenzia / azienda</Label>
        <Input id="demo-azienda" {...register("azienda", { required: "Questo campo è obbligatorio" })} />
        <FieldError message={errors.azienda?.message} />
      </div>
      <div>
        <Label htmlFor="demo-messaggio">Messaggio (opzionale)</Label>
        <Textarea id="demo-messaggio" rows={3} {...register("messaggio")} />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Invio in corso..." : "Invia richiesta"}
      </Button>
    </form>
  );
}
