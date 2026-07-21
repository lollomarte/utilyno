"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { completaInvitoAction } from "@/app/actions/inviti";
import { completaInvitoSchema, type CompletaInvitoInput } from "@/lib/validations/invito";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

export function CompletaInvitoForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompletaInvitoInput>({
    resolver: zodResolver(completaInvitoSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: CompletaInvitoInput) {
    setServerError(null);
    try {
      const result = await withTimeout(completaInvitoAction(data));
      if (!result.success) {
        setServerError(result.error);
        return;
      }

      const signInResult = await withTimeout(
        signIn("credentials", { email: result.email, password: data.password, redirect: false })
      );
      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/privato");
      router.refresh();
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("token")} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div>
        <Label htmlFor="password">Scegli una password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        <FieldError message={errors.password?.message} />
      </div>
      <div>
        <Label htmlFor="confermaPassword">Conferma password</Label>
        <Input id="confermaPassword" type="password" autoComplete="new-password" {...register("confermaPassword")} />
        <FieldError message={errors.confermaPassword?.message} />
      </div>
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Attivazione in corso..." : "Attiva il mio account"}
      </Button>
    </form>
  );
}
