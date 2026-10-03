"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Suggestion = { type: "article" | "research" | "video" | "collection"; title: string; slug: string; href: string; image?: { url: string; altText?: string } };

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" strokeLinecap="round" /></svg>;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "ig"));
  return <>{parts.map((part, index) => part.toLowerCase() === query.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part)}</>;
}

function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function typeLabel(type: Suggestion["type"]) { return type === "article" ? "Article" : type === "research" ? "Research" : type === "video" ? "Video" : "Collection"; }

export default function HeaderSearch() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutsideClick); document.removeEventListener("keydown", closeOnEscape); };
  }, [open]);

  useEffect(() => {
    if (!open || trimmedQuery.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal });
        const data = await response.json() as { results?: Suggestion[] };
        setSuggestions(data.results ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, trimmedQuery]);

  const close = () => { setOpen(false); setQuery(""); setSuggestions([]); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (trimmedQuery.length < 2) return; close(); router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`); };
  const selectSuggestion = (href: string) => { close(); router.push(href); };

  return <div className={`header-search ${open ? "header-search-open" : ""}`} ref={rootRef}>
    {open ? <form className="search-inline" role="search" onSubmit={submit}><button type="submit" className="search-inline-submit" aria-label="Submit search"><SearchIcon /></button><input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles, research, videos, collections..." aria-label="Search articles, research, videos, collections" aria-controls="header-search-suggestions" /><button type="button" className="search-inline-close" onClick={close} aria-label="Close search">×</button></form> : <button type="button" className="search-action" aria-expanded={open} aria-label="Open search" onClick={() => setOpen(true)}><SearchIcon /><span>Search</span></button>}
    {open && trimmedQuery.length >= 2 && <div id="header-search-suggestions" className="search-suggestions" role="listbox" aria-label="Search suggestions">
      {loading ? <p className="search-suggestions-status">Searching…</p> : suggestions.length ? <>{suggestions.map((item) => <button type="button" className="search-suggestion" role="option" aria-selected="false" key={`${item.type}-${item.slug}`} onClick={() => selectSuggestion(item.href)}><span className="search-suggestion-image">{item.image?.url ? <img src={item.image.url} alt="" /> : <span aria-hidden="true" />}</span><span className="search-suggestion-copy"><span className="search-suggestion-type">{typeLabel(item.type)}</span><span className="search-suggestion-title"><Highlight text={item.title} query={trimmedQuery} /></span></span></button>)}</> : <p className="search-suggestions-status">No results found</p>}
      <button type="button" className="search-suggestions-all" onClick={() => { close(); router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`); }}>View all results <span aria-hidden="true">→</span></button>
    </div>}
  </div>;
}
