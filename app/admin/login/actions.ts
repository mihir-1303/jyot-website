"use server";

import { AuthError } from "next-auth";
import { signIn } from "../../../lib/auth";
import { getSafeAdminRedirect } from "../../../lib/auth-redirect";

export type LoginState = { fields?: { email?: string; password?: string }; error?: string };

export async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = getSafeAdminRedirect(formData.get("callbackUrl"));
  const fields: LoginState["fields"] = {};
  if (!email) fields.email = "Email address is required.";
  else if (!/^\S+@\S+\.\S+$/.test(email)) fields.email = "Please enter a valid email address.";
  if (!password) fields.password = "Password is required.";
  if (fields.email || fields.password) return { fields };
  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
    return {};
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password. Please check your credentials and try again." };
    throw error;
  }
}
