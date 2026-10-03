"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { MediaPicker } from "./MediaPicker";
import { normalizeCmsError, validateCmsForm, type CmsFieldErrors } from "../../lib/cms/form-errors";
import { FieldError, FormErrorSummary } from "./FormFeedback";

export function AuthorForm({ action, value = {} }: { action: (formData: FormData) => Promise<unknown>; value?: Record<string, unknown> }) {
  const router = useRouter(); const [error, setError] = useState(""); const [fieldErrors, setFieldErrors] = useState<CmsFieldErrors>({}); const photo = (value.photo as { _id?: unknown })?._id ?? value.photo;
  return <form noValidate className="max-w-2xl space-y-5" action={async (formData) => { setError(""); try { await action(formData); router.push("/admin/authors"); router.refresh(); } catch (cause) { setError(normalizeCmsError(cause, "We couldn't save this author right now. Please try again.")); } }} onSubmit={(event) => { const result = validateCmsForm(event.currentTarget, "author"); setFieldErrors(result.fieldErrors); if (result.formError) { event.preventDefault(); setError(result.formError); const field = event.currentTarget.querySelector<HTMLInputElement>('[name="name"]'); field?.focus(); } }}><input type="hidden" name="id" value={String(value._id ?? "")} /><FormErrorSummary errors={fieldErrors} formError={error} /><label className="block text-sm">Name<span className="text-[var(--orange)]"> *</span><input className="mt-1 w-full border p-3" name="name" defaultValue={String(value.name ?? "")} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "error-name" : undefined} /><FieldError id="error-name" message={fieldErrors.name} /></label><label className="block text-sm">Slug<input className="mt-1 w-full border p-3" name="slug" defaultValue={String(value.slug ?? "")} /><span className="mt-1 block text-xs text-[var(--muted)]">Leave blank to generate a URL-safe slug from the name.</span></label><label className="block text-sm">Biography<textarea className="mt-1 w-full border p-3" name="bio" defaultValue={String(value.bio ?? "")} rows={5} /></label><MediaPicker name="photo" initialValue={String(photo ?? "")} /><p className="text-xs text-[var(--muted)]">Role/title is not available in the current Author model.</p>{error && !Object.keys(fieldErrors).length && <p className="cms-form-error" role="alert">{error}</p>}<SubmitButton edit={Boolean(value._id)} /></form>;
}

function SubmitButton({ edit }: { edit: boolean }) { const { pending } = useFormStatus(); return <button className="bg-[var(--orange)] px-5 py-3 font-bold text-white disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Saving…" : edit ? "Save author" : "Create author"}</button>; }
