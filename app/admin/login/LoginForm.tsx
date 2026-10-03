"use client";

import { useActionState, useState } from "react";
import type { LoginState } from "./actions";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.4 0 9 5.9 9 7s-3.6 7-9 7a9.6 9.6 0 0 1-4.1-.9" /><path d="M6.6 6.6C4.2 8.1 3 11 3 12c0 1.1 3.6 7 9 7" /></svg> : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"><path d="M3 12s3.6-7 9-7 9 5.9 9 7-3.6 7-9 7-9-5.9-9-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}

export function LoginForm({ action, callbackUrl }: { action: (state: LoginState, formData: FormData) => Promise<LoginState>; callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  return <form action={formAction} className="login-form">
    <input type="hidden" name="callbackUrl" value={callbackUrl} />
    <div className="login-field"><label htmlFor="login-email">Email address</label><input id="login-email" name="email" type="email" autoComplete="email" placeholder="Enter your email address" aria-invalid={Boolean(state.fields?.email)} aria-describedby={state.fields?.email ? "login-email-error" : undefined} />{state.fields?.email && <p className="login-field-error" id="login-email-error">{state.fields.email}</p>}</div>
    <div className="login-field"><label htmlFor="login-password">Password</label><div className="login-password-wrap"><input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" aria-invalid={Boolean(state.fields?.password)} aria-describedby={state.fields?.password ? "login-password-error" : undefined} /><button className="login-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}><EyeIcon hidden={showPassword} /></button></div>{state.fields?.password && <p className="login-field-error" id="login-password-error">{state.fields.password}</p>}</div>
    {state.error && <p className="login-form-error" role="alert">{state.error}</p>}
    <button className="login-submit" type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
  </form>;
}
