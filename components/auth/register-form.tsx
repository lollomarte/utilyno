"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { registerSchema, registerFormSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { PORTAL_BY_ROLE } from "@/auth.config";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "PRIVATO", label: "Privato" },
  { value: "AGENZIA", label: "Agenzia" },
  { value: "AMMINISTRATORE", label: "Amministratore di condominio" },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { role: "PRIVATO" },
  });

  const role = watch("role");
  const isRagioneSocialeRole = role === "AGENZIA" || role === "AMMINISTRATORE";

  async function onSubmit(data: RegisterFormValues) {
    setServerError(null);

    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path.join(".") as keyof RegisterFormValues;
        if (field) setError(field, { message: issue.message });
      }
      return;
    }

    try {
      const response = await withTimeout(
        fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        })
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setServerError(body?.error || "Registrazione non riuscita. Riprova.");
        return;
      }

      const result = await withTimeout(
        signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        })
      );

      if (result?.error) {
        router.push("/login");
        return;
      }

      const session = await getSession();
      router.push(PORTAL_BY_ROLE[session?.user?.role ?? ""] ?? "/");
      router.refresh();
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader title="Crea un account" description="Registrati scegliendo il tuo profilo" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="role">Tipo di account</Label>
          <Select id="role" {...register("role")}>
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" {...register("nome")} />
            <FieldError message={errors.nome?.message} />
          </div>
          <div>
            <Label htmlFor="cognome">Cognome</Label>
            <Input id="cognome" {...register("cognome")} />
            <FieldError message={errors.cognome?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="telefono">Telefono (opzionale)</Label>
          <Input id="telefono" {...register("telefono")} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          <FieldError message={errors.password?.message} />
        </div>

        {isRagioneSocialeRole && (
          <>
            <div>
              <Label htmlFor="ragioneSociale">Ragione sociale</Label>
              <Input id="ragioneSociale" {...register("ragioneSociale")} />
              <FieldError message={errors.ragioneSociale?.message} />
            </div>
            <div>
              <Label htmlFor="piva">Partita IVA</Label>
              <Input id="piva" inputMode="numeric" placeholder="12345678901" {...register("piva")} />
              <FieldError message={errors.piva?.message} />
            </div>
            <div>
              <Label htmlFor="indirizzo">Indirizzo sede</Label>
              <Input id="indirizzo" {...register("indirizzo")} />
              <FieldError message={errors.indirizzo?.message} />
            </div>
          </>
        )}

        {role === "PRIVATO" && (
          <p className="text-xs text-slate-500">
            Dopo la registrazione potrai attivare tu stesso il profilo Proprietario inserendo il tuo primo immobile,
            oppure diventare Inquilino quando un&apos;agenzia ti collega a un contratto.
          </p>
        )}

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creazione account..." : "Registrati"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Hai già un account?{" "}
        <Link href="/login" className="font-medium text-ink underline">
          Accedi
        </Link>
      </p>
    </Card>
  );
}
