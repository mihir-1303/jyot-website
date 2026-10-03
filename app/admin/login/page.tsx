import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import { getSafeAdminRedirect } from "../../../lib/auth-redirect";
import { LoginForm } from "./LoginForm";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string | string[] }> }) {
  const destination = getSafeAdminRedirect((await searchParams).callbackUrl);
  if (await getCurrentUser()) redirect(destination);
  return <main className="login-page"><section className="login-card" aria-labelledby="login-title"><div className="login-brand"><span className="login-brand-mark">J</span><span><strong>JYOT</strong><small>Editorial CMS</small></span></div><div className="login-rule" /><p className="login-kicker">Secure workspace</p><h1 className="login-title" id="login-title">Welcome back</h1><p className="login-intro">Sign in to continue to the Jyot editorial CMS.</p><LoginForm action={loginAction} callbackUrl={destination} /></section></main>;
}
