"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type PushArticlesToFeaturedResult = { ok: boolean; message: string };
type Props = { articleIds: string[]; pushAction: (formData: FormData) => Promise<PushArticlesToFeaturedResult>; children: React.ReactNode };

export function ArticleBulkSelection({ articleIds, pushAction, children }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const allSelected = articleIds.length > 0 && articleIds.every((id) => selected.has(id));

  useEffect(() => {
    wrapperRef.current?.querySelectorAll<HTMLElement>("[data-article-selectable]").forEach((row) => {
      const checked = selected.has(row.dataset.articleId ?? "");
      row.classList.toggle("admin-article-selected", checked);
      row.setAttribute("aria-selected", String(checked));
      const checkbox = row.querySelector<HTMLInputElement>("[data-article-checkbox]");
      if (checkbox) checkbox.checked = checked;
    });
  }, [selected]);

  const toggle = (id: string) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const onClick = (event: React.MouseEvent<HTMLDivElement>) => { const target = event.target as Element; if (target.closest("a,button,input,select,textarea")) return; const row = target.closest<HTMLElement>("[data-article-selectable]"); if (row?.dataset.articleId) toggle(row.dataset.articleId); };
  const onChange = (event: React.FormEvent<HTMLDivElement>) => { const target = event.target as HTMLInputElement; if (!target.matches("[data-article-checkbox]")) return; const row = target.closest<HTMLElement>("[data-article-selectable]"); if (!row?.dataset.articleId) return; setSelected((current) => { const next = new Set(current); if (target.checked) next.add(row.dataset.articleId as string); else next.delete(row.dataset.articleId as string); return next; }); };
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key !== "Enter" && event.key !== " ") return; const target = event.target as Element; if (target.closest("a,button,input,select,textarea")) return; const row = target.closest<HTMLElement>("[data-article-selectable]"); if (row?.dataset.articleId) { event.preventDefault(); toggle(row.dataset.articleId); } };
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const formData = new FormData(event.currentTarget); startTransition(async () => { const result = await pushAction(formData); setMessage(result.message); if (result.ok) { setSelected(new Set()); router.refresh(); } }); };

  return <div ref={wrapperRef} onClick={onClick} onChange={onChange} onKeyDown={onKeyDown}>
    {articleIds.length > 0 && <div className="mb-3 flex items-center gap-2 text-sm"><input id="select-all-articles" type="checkbox" checked={allSelected} onChange={(event) => setSelected(event.target.checked ? new Set(articleIds) : new Set())} /><label htmlFor="select-all-articles">Select all visible articles</label></div>}
    {selected.size > 0 && <div className="sticky top-4 z-10 mb-4 flex flex-wrap items-center gap-3 border border-[var(--orange)] bg-white p-3 shadow-sm" aria-live="polite"><strong>{selected.size} {selected.size === 1 ? "article" : "articles"} selected</strong><form className="flex flex-wrap items-center gap-2" onSubmit={submit}><input type="hidden" name="articleIds" value={[...selected].join(",")} /><button className="bg-[var(--orange)] px-3 py-2 text-sm font-bold text-white" type="submit" disabled={pending}>{pending ? "Adding…" : "Push to Featured"}</button><button className="border px-3 py-2 text-sm" type="button" onClick={() => setSelected(new Set())}>Clear selection</button></form></div>}
    {message && <p className={`mb-4 text-sm ${message.includes("added") || message.includes("already") ? "text-green-700" : "text-red-700"}`} role="status">{message}</p>}
    {children}
  </div>;
}
