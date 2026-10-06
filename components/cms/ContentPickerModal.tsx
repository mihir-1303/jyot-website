"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ContentPickerItem = { id: string; title: string; type: "article" | "video" | "research"; image?: string; status?: string; publishedAt?: string };

type Props = { open: boolean; items: ContentPickerItem[]; selectedIds: string[]; onClose: () => void; onConfirm: (ids: string[]) => void; title: string; allowedTypes?: ContentPickerItem["type"][] };

const typeLabels: Record<ContentPickerItem["type"], string> = { article: "Articles", video: "Videos", research: "Research" };

export function ContentPickerModal({ open, items, selectedIds, onClose, onConfirm, title, allowedTypes }: Props) {
  const [draftIds, setDraftIds] = useState(selectedIds);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ContentPickerItem["type"] | "all">("all");
  const dialogRef = useRef<HTMLDivElement>(null);
  const availableTypes = allowedTypes ?? [...new Set(items.map((item) => item.type))];

  useEffect(() => { if (!open) return; const timer = window.setTimeout(() => { setDraftIds(selectedIds); setQuery(""); setType("all"); }, 0); return () => window.clearTimeout(timer); }, [open, selectedIds]);
  useEffect(() => { if (!open) return; const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } }; document.addEventListener("keydown", onKeyDown); return () => document.removeEventListener("keydown", onKeyDown); }, [open, onClose]);

  const filtered = useMemo(() => { const normalized = query.trim().toLowerCase(); return items.filter((item) => (!normalized || item.title.toLowerCase().includes(normalized)) && (type === "all" || item.type === type)); }, [items, query, type]);
  const toggle = (id: string) => setDraftIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const confirm = () => { onConfirm(draftIds); onClose(); };
  if (!open) return null;
  const selectedLabel = draftIds.length === 1 ? "item" : "items";
  return <div className="cms-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="cms-modal cms-content-picker-modal" role="dialog" aria-modal="true" aria-labelledby="content-picker-title" ref={dialogRef}>
      <div className="cms-modal-header"><div><p className="eyebrow">Homepage content</p><h2 id="content-picker-title" className="serif">{title}</h2></div><button type="button" className="cms-modal-close" onClick={onClose} aria-label="Close content picker">×</button></div>
      <div className="cms-content-picker-toolbar"><label className="cms-content-picker-search"><span className="sr-only">Search content</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label><div className="cms-content-picker-filters" role="group" aria-label="Filter content type"><button type="button" className={type === "all" ? "is-active" : ""} onClick={() => setType("all")}>All</button>{availableTypes.map((itemType) => <button type="button" className={type === itemType ? "is-active" : ""} onClick={() => setType(itemType)} key={itemType}>{typeLabels[itemType]}</button>)}</div></div>
      <div className="cms-content-picker-results" role="listbox" aria-label={title} aria-multiselectable="true">{filtered.map((item) => { const selected = draftIds.includes(item.id); return <button type="button" role="option" aria-selected={selected} className={`cms-content-picker-card ${selected ? "is-selected" : ""}`} onClick={() => toggle(item.id)} key={item.id}>{item.image ? <img src={item.image} alt="" /> : <span className="cms-content-picker-placeholder" aria-hidden="true">{item.type[0].toUpperCase()}</span>}<span className="cms-content-picker-card-body"><strong>{item.title}</strong><small>{typeLabels[item.type]} · {item.status ?? "Published"}{item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString("en-IN")}` : ""}</small></span><span className="cms-content-picker-check" aria-hidden="true">{selected ? "✓" : ""}</span></button>; })}{!filtered.length && <p className="cms-content-picker-empty">No matching content.</p>}</div>
      <div className="cms-content-picker-footer"><span>{draftIds.length} selected</span><div><button type="button" className="media-secondary-button" onClick={onClose}>Cancel</button><button type="button" className="media-primary-button" onClick={confirm}>{draftIds.length ? `Add ${draftIds.length} ${selectedLabel}` : "Add selected"}</button></div></div>
    </div>
  </div>;
}
