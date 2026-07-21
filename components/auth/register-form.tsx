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
import { cn } from "@/lib/utils";

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
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { role: "PRIVATO", tipoSoggetto: "PERSONA_FISICA" },
  });

  const role = watch("role");
  const tipoSoggetto = watch("tipoSoggetto");
  const isRagioneSocialeRole = role === "AGENZIA" || role === "AMMINISTRATORE";
  const isPrivatoAzienda = role === "PRIVATO" && tipoSoggetto === "AZIENDA";

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

        {role === "PRIVATO" && (
          <div>
            <Label htmlFor="tipoSoggetto">Sei una persona fisica o un&apos;azienda?</Label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="tipoSoggetto">
              {(
                [
                  { value: "PERSONA_FISICA", label: "Persona fisica" },
                  { value: "AZIENDA", label: "Azienda" },
                ] as const
              ).map((opzione) => (
                <button
                  key={opzione.value}
                  type="button"
                  onClick={() => setValue("tipoSoggetto", opzione.value)}
                  aria-pressed={tipoSoggetto === opzione.value}
                  className={cn(
                    "rounded-control px-4 py-2 text-sm font-medium ring-1 ring-inset transition-colors",
                    tipoSoggetto === opzione.value
                      ? "bg-primary text-white ring-primary"
                      : "bg-white text-ink ring-border hover:bg-surface-muted"
                  )}
                >
                  {opzione.label}
                </button>
              ))}
            </div>
            <input type="hidden" {...register("tipoSoggetto")} />
          </div>
        )}

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

        {role === "PRIVATO" && tipoSoggetto === "PERSONA_FISICA" && (
          <div>
            <Label htmlFor="codiceFiscale">Codice fiscale</Label>
            <Input id="codiceFiscale" placeholder="RSSMRA80A01H501U" {...register("codiceFiscale")} />
            <FieldError message={errors.codiceFiscale?.message} />
          </div>
        )}

        {isPrivatoAzienda && (
          <div className="space-y-4 rounded-md bg-surface-muted p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Dati azienda</p>
            <div>
              <Label htmlFor="ragioneSocialePrivato">Ragione sociale</Label>
              <Input id="ragioneSocialePrivato" {...register("ragioneSociale")} />
              <FieldError message={errors.ragioneSociale?.message} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pivaPrivato">Partita IVA</Label>
                <Input id="pivaPrivato" inputMode="numeric" placeholder="12345678901" {...register("piva")} />
                <FieldError message={errors.piva?.message} />
              </div>
              <div>
                <Label htmlFor="codiceFiscaleAzienda">Codice fiscale azienda</Label>
                <Input id="codiceFiscaleAzienda" {...register("codiceFiscale")} />
                <FieldError message={errors.codiceFiscale?.message} />
                <p className="mt-1 text-xs text-slate-400">Spesso coincide con la Partita IVA.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="referenteNome">Nome del referente/firmatario</Label>
                <Input id="referenteNome" {...register("referenteNome")} />
                <FieldError message={errors.referenteNome?.message} />
              </div>
              <div>
                <Label htmlFor="referenteRuolo">Ruolo del referente</Label>
                <Input id="referenteRuolo" placeholder="Amministratore delegato" {...register("referenteRuolo")} />
                <FieldError message={errors.referenteRuolo?.message} />
              </div>
            </div>
          </div>
        )}

        {role === "PRIVATO" && (
          <p className="text-xs text-slate-500">
            Dopo la registrazione potrai aggiungere il tuo primo immobile come proprietario, oppure collegarti a un
            contratto come inquilino tramite un invito ricevuto dall&apos;agenzia.
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
