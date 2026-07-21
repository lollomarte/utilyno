"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creaPartnerAction, aggiornaPartnerAction } from "@/app/actions/partner";
import { partnerSchema, type PartnerInput, type PartnerFormInput } from "@/lib/validations/partner";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIA_INTERVENTO_LABELS } from "@/lib/labels";
import { withTimeout } from "@/lib/utils";

export interface PartnerEsistente {
  id: string;
  nome: string;
  categoria: string;
  zonaCopertura: string;
  telefono: string;
  email: string;
  contattoReferente: string;
  commissioneMedia: number | null;
  attivo: boolean;
  piva: string | null;
  pec: string | null;
}

export function PartnerForm({ partner, onSuccess }: { partner?: PartnerEsistente; onSuccess?: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartnerFormInput, unknown, PartnerInput>({
    resolver: zodResolver(partnerSchema),
    defaultValues: partner
      ? {
          nome: partner.nome,
          categoria: partner.categoria as PartnerInput["categoria"],
          zonaCopertura: partner.zonaCopertura,
          telefono: partner.telefono,
          email: partner.email,
          contattoReferente: partner.contattoReferente,
          commissioneMedia: partner.commissioneMedia ?? undefined,
          piva: partner.piva ?? "",
          pec: partner.pec ?? "",
        }
      : { categoria: "IDRAULICO" },
  });

  async function onSubmit(data: PartnerInput) {
    setServerError(null);
    try {
      const result = partner
        ? await withTimeout(aggiornaPartnerAction(partner.id, data))
        : await withTimeout(creaPartnerAction(data));
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      router.refresh();
      onSuccess?.();
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" {...register("nome")} />
        <FieldError message={errors.nome?.message} />
      </div>
      <div>
        <Label htmlFor="categoria">Categoria</Label>
        <Select id="categoria" {...register("categoria")}>
          {Object.entries(CATEGORIA_INTERVENTO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="zonaCopertura">Zona di copertura</Label>
        <Input id="zonaCopertura" placeholder="es. Milano e provincia" {...register("zonaCopertura")} />
        <FieldError message={errors.zonaCopertura?.message} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="telefono">Telefono</Label>
          <Input id="telefono" {...register("telefono")} />
          <FieldError message={errors.telefono?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="contattoReferente">Contatto referente</Label>
        <Input id="contattoReferente" {...register("contattoReferente")} />
        <FieldError message={errors.contattoReferente?.message} />
      </div>
      <div>
        <Label htmlFor="commissioneMedia">Commissione media stimata per lead (opzionale, solo uso interno)</Label>
        <Input id="commissioneMedia" type="number" step="0.01" {...register("commissioneMedia")} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="piva">Partita IVA (opzionale)</Label>
          <Input id="piva" {...register("piva")} />
        </div>
        <div>
          <Label htmlFor="pec">PEC (opzionale)</Label>
          <Input id="pec" type="email" {...register("pec")} />
        </div>
      </div>
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio..." : partner ? "Salva modifiche" : "Crea partner"}
      </Button>
    </form>
  );
}
