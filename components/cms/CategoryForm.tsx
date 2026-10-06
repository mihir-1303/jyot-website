"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategory } from "../../lib/cms/category-actions";
import { normalizeCmsError, validateCmsForm, type CmsFieldErrors } from "../../lib/cms/form-errors";
import { FieldError, FormErrorSummary } from "./FormFeedback";

type Category = { _id?: unknown; name?: string; slug?: string; description?: string; active?: boolean; displayOrder?: number };

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter(); const [error, setError] = useState(""); const [fieldErrors, setFieldErrors] = useState<CmsFieldErrors>({});
  return <form noValidate action={async (formData) => { try { await saveCategory(formData); router.push("/admin/categories"); router.refresh(); } catch (cause) { setError(normalizeCmsError(cause, "We could not save this category right now.")); } }} onSubmit={(event) => { const result = validateCmsForm(event.currentTarget, "category"); setFieldErrors(result.fieldErrors); if (result.formError) { event.preventDefault(); setError(result.formError); event.currentTarget.querySelector<HTMLInputElement>('[name="name"]')?.focus(); } }} className="mt-6 max-w-2xl space-y-5 border bg-white p-6">
    {Boolean(category?._id) && <input type="hidden" name="id" value={String(category?._id)} />}
    <FormErrorSummary errors={fieldErrors} formError={error} />
    <label className="block text-sm font-bold">Name<input className="mt-1 block w-full border p-3 font-normal" name="name" defaultValue={String(category?.name ?? "")} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "error-category-name" : undefined} /><FieldError id="error-category-name" message={fieldErrors.name} /></label>
    <label className="block text-sm font-bold">Slug<input className="mt-1 block w-full border p-3 font-normal" name="slug" defaultValue={String(category?.slug ?? "")} placeholder="Generated from name when blank" /></label>
    <label className="block text-sm font-bold">Description<textarea className="mt-1 block w-full border p-3 font-normal" name="description" defaultValue={String(category?.description ?? "")} rows={3} /></label>
    <label className="block text-sm font-bold">Display order<input className="mt-1 block w-32 border p-3 font-normal" name="displayOrder" type="number" defaultValue={String(category?.displayOrder ?? 0)} /></label>
    <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={category?.active !== false} /> Active</label>
    {error && !Object.keys(fieldErrors).length && <p className="cms-form-error" role="alert">{error}</p>}
    <button className="bg-[var(--orange)] px-4 py-3 font-bold text-white" type="submit">Save category</button>
  </form>;
}
