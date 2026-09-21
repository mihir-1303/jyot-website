"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { MediaPicker } from "./MediaPicker";

export function AuthorForm({ action, value = {} }: { action: (formData: FormData) => Promise<unknown>; value?: Record<string, unknown> }) {
  const router = useRouter(); const [error, setError] = useState(""); const photo = (value.photo as { _id?: unknown })?._id ?? value.photo;
  return <form className="max-w-2xl space-y-5" action={async (formData) => { setError(""); try { await action(formData); router.push("/admin/authors"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save author."); } }}><input type="hidden" name="id" value={String(value._id ?? "")} /><label className="block text-sm">Name<span className="text-[var(--orange)]"> *</span><input className="mt-1 w-full border p-3" name="name" defaultValue={String(value.name ?? "")} required /></label><label className="block text-sm">Slug<input className="mt-1 w-full border p-3" name="slug" defaultValue={String(value.slug ?? "")} /><span className="mt-1 block text-xs text-[var(--muted)]">Leave blank to generate a URL-safe slug from the name.</span></label><label className="block text-sm">Biography<textarea className="mt-1 w-full border p-3" name="bio" defaultValue={String(value.bio ?? "")} rows={5} /></label><MediaPicker name="photo" initialValue={String(photo ?? "")} /><p className="text-xs text-[var(--muted)]">Role/title is not available in the current Author model.</p>{error && <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}<SubmitButton edit={Boolean(value._id)} /></form>;
}

function SubmitButton({ edit }: { edit: boolean }) { const { pending } = useFormStatus(); return <button className="bg-[var(--orange)] px-5 py-3 font-bold text-white disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Saving…" : edit ? "Save author" : "Create author"}</button>; }
