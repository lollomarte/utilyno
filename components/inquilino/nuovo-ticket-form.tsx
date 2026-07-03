"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaTicketAction } from "@/app/actions/ticket";
import { nuovoTicketSchema, type NuovoTicketInput } from "@/lib/validations/ticket";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NuovoTicketForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NuovoTicketInput>({
    resolver: zodResolver(nuovoTicketSchema),
    defaultValues: { priorita: "MEDIA" },
  });

  async function onSubmit(data: NuovoTicketInput) {
    setServerError(null);
    const result = await creaTicketAction(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    reset({ titolo: "", descrizione: "", priorita: "MEDIA" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader title="Nuova segnalazione" description="Segnala un problema relativo al tuo immobile" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="titolo">Titolo</Label>
          <Input id="titolo" {...register("titolo")} />
          <FieldError message={errors.titolo?.message} />
        </div>
        <div>
          <Label htmlFor="descrizione">Descrizione</Label>
          <Textarea id="descrizione" rows={4} {...register("descrizione")} />
          <FieldError message={errors.descrizione?.message} />
        </div>
        <div>
          <Label htmlFor="priorita">Priorità</Label>
          <Select id="priorita" {...register("priorita")}>
            <option value="BASSA">Bassa</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </Select>
        </div>
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Invio in corso..." : "Invia segnalazione"}
        </Button>
      </form>
    </Card>
  );
}
