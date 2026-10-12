"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/Button";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          className="w-full border border-line bg-surface-2 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-line bg-surface-2 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
      </div>
      {state?.error && <p className="text-sm text-loss">{state.error}</p>}
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Accesso..." : "Accedi"}
      </Button>
    </form>
  );
}
