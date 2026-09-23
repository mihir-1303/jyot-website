"use client";

import { useActionState } from "react";
import type { LoginState } from "./actions";

export function LoginForm({ action }: { action: (state: LoginState, formData: FormData) => Promise<LoginState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="mt-8 max-w-md space-y-5 border bg-white p-6 shadow-sm">
    <label className="block text-sm">Email<input className="mt-1 w-full border p-3" name="email" type="email" autoComplete="email" required /></label>
    <label className="block text-sm">Password<input className="mt-1 w-full border p-3" name="password" type="password" autoComplete="current-password" required /></label>
    {state.error && <p className="text-sm text-red-700" role="alert">{state.error}</p>}
    <button className="bg-[var(--orange)] px-5 py-3 font-bold text-white disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
