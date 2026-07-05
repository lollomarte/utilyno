"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    try {
      const result = await withTimeout(signIn("credentials", { ...data, redirect: false }));

      if (result?.error) {
        setServerError("Credenziali non valide. Riprova.");
        return;
      }

      router.push(callbackUrl || "/");
      router.refresh();
    } catch {
      setServerError("Qualcosa è andato storto, riprova.");
    }
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader title="Accedi" description="Inserisci le tue credenziali per continuare" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          <FieldError message={errors.password?.message} />
        </div>
        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Accesso in corso..." : "Accedi"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Non hai un account?{" "}
        <Link href="/register" className="font-medium text-ink underline">
          Registrati
        </Link>
      </p>
    </Card>
  );
}
