"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";

type Option = { id: string; name: string };

export function TaxonomyMultiSelect({ name, label, options, initialValue, placeholder = "Select options...", required = false, single = false }: { name: string; label: string; options: Option[]; initialValue?: string; placeholder?: string; required?: boolean; single?: boolean }) {
  const [selected, setSelected] = useState(() => initialValue ? initialValue.split(",").filter(Boolean) : []);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedOptions = selected.map((id) => options.find((option) => option.id === id)).filter((option): option is Option => Boolean(option));
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? options.filter((option) => option.name.toLowerCase().includes(query)) : options;
  }, [options, search]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const toggleOpen = () => { setOpen((value) => !value); setSearch(""); };
  const openWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(true); setSearch(""); window.setTimeout(() => searchRef.current?.focus(), 0); }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
  };
  const toggleOption = (id: string) => { if (single) { setSelected([id]); setOpen(false); setSearch(""); return; } setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]); };
  const removeOption = (event: ReactMouseEvent<HTMLButtonElement>, id: string) => { event.stopPropagation(); setSelected((current) => current.filter((value) => value !== id)); };

  return <div className="taxonomy-multiselect" ref={containerRef}>
    <span className="taxonomy-multiselect-label">{label}{required && <span aria-hidden="true" className="required-mark">*</span>}</span>
    <input type="hidden" name={name} value={selected.join(",")} />
    <div className={`taxonomy-multiselect-trigger ${open ? "taxonomy-multiselect-trigger-open" : ""}`} role="button" tabIndex={0} aria-haspopup="listbox" aria-expanded={open} onClick={toggleOpen} onKeyDown={openWithKeyboard}>
      <span className="taxonomy-multiselect-chips">{selectedOptions.length ? selectedOptions.map((option) => <span className="taxonomy-chip" key={option.id}>{option.name}<button type="button" aria-label={`Remove ${option.name}`} onClick={(event) => removeOption(event, option.id)}>x</button></span>) : <span className="taxonomy-multiselect-placeholder">{placeholder}</span>}</span><span className="taxonomy-multiselect-chevron" aria-hidden="true">v</span>
    </div>
    {open && <div className="taxonomy-multiselect-menu" role="listbox" aria-label={label} aria-multiselectable={!single}>
      <input ref={searchRef} className="taxonomy-multiselect-search" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setOpen(false); } }} placeholder={`Search ${label.toLowerCase()}...`} aria-label={`Search ${label.toLowerCase()}`} />
      <div className="taxonomy-multiselect-options">{filteredOptions.map((option) => <button type="button" role="option" aria-selected={selected.includes(option.id)} className={`taxonomy-multiselect-option ${selected.includes(option.id) ? "taxonomy-multiselect-option-selected" : ""}`} onClick={() => toggleOption(option.id)} key={option.id}><span aria-hidden="true">{selected.includes(option.id) ? "[x]" : single ? "" : "[ ]"}</span>{option.name}</button>)}{!filteredOptions.length && <p className="taxonomy-multiselect-empty">No matching {label.toLowerCase()}.</p>}</div>
    </div>}
  </div>;
}
