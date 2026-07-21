"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full border border-line rounded-lg px-3 py-2 text-sm"
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
          className="w-full border border-line rounded-lg px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-ink text-paper rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
      >
        {pending ? "Accesso..." : "Accedi"}
      </button>
    </form>
  );
}
