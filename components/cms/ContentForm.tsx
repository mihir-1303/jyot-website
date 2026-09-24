"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { MediaPicker } from "./MediaPicker";
import { RichTextEditor } from "./RichTextEditor";

type Option = { id: string; name: string };
type Props = { action: (formData: FormData) => Promise<unknown>; kind: "article" | "video" | "research"; value?: Record<string, unknown>; options?: { authors: Option[]; categories: Option[]; tags: Option[] } };

export function ContentForm({ action, kind, value = {}, options = { authors: [], categories: [], tags: [] } }: Props) {
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const selectedAuthor = (value.author as { _id?: unknown })?._id ?? value.author;
  const authors = Array.isArray(value.authors) ? value.authors.map((item) => String((item as { _id?: unknown })._id ?? item)) : [];
  const mediaId = (field: string) => String(((value[field] as { _id?: unknown })?._id ?? value[field]) ?? "");
  const isEdit = Boolean(value._id);
  const adminPath = kind === "article" ? "/admin/articles" : kind === "video" ? "/admin/videos" : "/admin/research";

  return <form action={async (formData) => { setError(""); try { await action(formData); router.push(adminPath); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : `Unable to save ${kind}.`); } }} onChange={() => setDirty(true)} className="max-w-3xl space-y-5">
    <input type="hidden" name="id" value={String(value._id ?? "")} />
    <Field label="Title" name="title" value={value.title} required />
    <Field label="Slug" name="slug" value={value.slug} />
    <p className="-mt-3 text-xs text-[var(--muted)]">Leave blank to generate a URL-safe slug from the title.</p>
    <label className="block text-sm">Summary / excerpt<textarea className="mt-1 w-full border p-3" name="excerpt" defaultValue={String(value.excerpt ?? "")} /></label>
    {kind !== "video" && <label className="block text-sm">Body<RichTextEditor name="content" initialValue={value.content} onDirty={() => setDirty(true)} /></label>}
    {kind === "article" && <><Select name="author" label="Credited author" value={String(selectedAuthor ?? "")} options={options.authors} required /><Select name="category" label="Category" value={mediaId("category")} options={options.categories} required /><Select name="tags" label="Tags" value={Array.isArray(value.tags) ? value.tags.map((item) => String((item as { _id?: unknown })._id ?? item)).join(",") : ""} options={options.tags} multiple /><MediaPicker name="coverMedia" initialValue={mediaId("coverMedia")} /></>}
    {kind === "research" && <><Field label="Description" name="description" value={value.description} textarea required /><Select name="authors" label="Authors" value={authors.join(",")} options={options.authors} multiple /><Select name="category" label="Category" value={mediaId("category")} options={options.categories} required /><MediaPicker name="coverMedia" initialValue={mediaId("coverMedia")} /><MediaPicker name="pdfMedia" initialValue={mediaId("pdfMedia")} /><Field label="Research type" name="type" value={value.type ?? "Analysis"} required /></>}
    {kind === "video" && <><label className="block text-sm">Description<RichTextEditor name="description" initialValue={value.description ?? value.excerpt} onDirty={() => setDirty(true)} /></label><Select name="author" label="Presenter / author" value={String(selectedAuthor ?? "")} options={options.authors} /><Select name="category" label="Category" value={mediaId("category")} options={options.categories} required /><MediaPicker name="thumbnail" initialValue={mediaId("thumbnail")} /><label className="block text-sm">Source type<select className="mt-1 w-full border p-3" name="sourceType" defaultValue={String(value.sourceType ?? "external")}><option value="external">External video</option><option value="r2">R2 media</option></select></label><label className="block text-sm">Provider<select className="mt-1 w-full border p-3" name="provider" defaultValue={String(value.provider ?? "")}><option value="">Select provider</option><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="other">Other</option></select></label><Field label="Video URL" name="externalUrl" value={value.externalUrl} type="url" /><Field label="Duration" name="duration" value={value.duration} /><MediaPicker name="media" initialValue={mediaId("media")} /></>}
    {kind !== "video" && <><Field label="Meta title" name="metaTitle" value={(value.seo as { metaTitle?: string })?.metaTitle} /><Field label="Meta description" name="metaDescription" value={(value.seo as { metaDescription?: string })?.metaDescription} textarea /></>}
    <label className="block text-sm">Status<select className="mt-1 w-full border p-3" name="status" defaultValue={String(value.status ?? "draft")}><option value="draft">Draft</option><option value="review">Review</option><option value="scheduled">Scheduled</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
    <fieldset className="border p-3"><legend className="px-1 text-sm font-bold">Scheduled publication</legend><label className="block text-sm">Local date and time<input className="mt-1 w-full border p-3" name="scheduledLocal" type="datetime-local" defaultValue={value.scheduledAt ? new Date(String(value.scheduledAt)).toISOString().slice(0, 16) : ""} /></label><label className="mt-3 block text-sm">Timezone<select className="mt-1 w-full border p-3" name="scheduledTimezone" defaultValue="Asia/Kolkata"><option value="Asia/Kolkata">India Standard Time (IST)</option><option value="UTC">UTC</option><option value="America/New_York">Eastern Time</option><option value="Europe/London">United Kingdom</option></select></label><p className="mt-2 text-xs text-[var(--muted)]">Used when Status is Scheduled. The server converts this to UTC.</p></fieldset>
    <label className="block text-sm">Publication date<input className="mt-1 w-full border p-3" name="publishedAt" type="datetime-local" defaultValue={value.publishedAt ? new Date(String(value.publishedAt)).toISOString().slice(0, 16) : ""} /></label>
    {dirty && <p className="text-sm text-amber-700">Unsaved changes will be lost if you leave this page.</p>}
    {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <SubmitButton label={`${isEdit ? "Save changes" : "Create"} ${kind}`} />
  </form>;
}

function SubmitButton({ label }: { label: string }) { const { pending } = useFormStatus(); return <button className="bg-[var(--orange)] px-5 py-3 font-bold text-white disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Saving…" : label}</button>; }
function Field({ label, name, value, textarea = false, type = "text", required = false }: { label: string; name: string; value: unknown; textarea?: boolean; type?: string; required?: boolean }) { return <label className="block text-sm">{label}{textarea ? <textarea className="mt-1 w-full border p-3" name={name} defaultValue={String(value ?? "")} required={required} /> : <input className="mt-1 w-full border p-3" name={name} type={type} defaultValue={String(value ?? "")} required={required} />}</label>; }
function Select({ name, label, value, options, multiple = false, required = false }: { name: string; label: string; value: string; options: Option[]; multiple?: boolean; required?: boolean }) { const [selected, setSelected] = useState(value ? value.split(",").filter(Boolean) : []); const hasOptions = options.length > 0; return <label className="block text-sm">{label}<select className="mt-1 w-full border p-3" name={multiple ? `${name}Select` : name} value={multiple ? selected : selected[0] ?? ""} onChange={(event) => setSelected(multiple ? [...event.target.selectedOptions].map((option) => option.value) : [event.target.value])} multiple={multiple} required={required} disabled={!hasOptions}>{!multiple && <option value="">{hasOptions ? `Select ${label.toLowerCase()}` : `No ${label.toLowerCase()} available. Create one first.`}</option>}{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select>{multiple && <input type="hidden" name={name} value={selected.join(",")} />}{!hasOptions && <span className="mt-1 block text-xs text-amber-700">No {label.toLowerCase()} available. Create one first.</span>}</label>; }
