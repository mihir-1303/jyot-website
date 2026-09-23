import { LoginForm } from "./LoginForm";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  return <main className="page-shell section"><p className="eyebrow">Jyot CMS</p><h1 className="serif mt-3 text-5xl">Sign in</h1><p className="mt-3 max-w-md text-[var(--muted)]">Use your administrator credentials to continue.</p><LoginForm action={loginAction} /></main>;
}
