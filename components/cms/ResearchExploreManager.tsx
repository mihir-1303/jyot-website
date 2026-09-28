"use client";

import { useState } from "react";

type Candidate = { id: string; title: string };
type Props = { revision: number; initialIds: string[]; candidates: Candidate[]; saveAction: (formData: FormData) => Promise<void> };

export function ResearchExploreManager({ revision, initialIds, candidates, saveAction }: Props) {
  const [ids, setIds] = useState(initialIds.filter((id) => candidates.some((item) => item.id === id)));
  const selected = ids.map((id) => candidates.find((item) => item.id === id)).filter((item): item is Candidate => Boolean(item));
  const toggle = (id: string) => setIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const move = (index: number, direction: -1 | 1) => { const target = index + direction; if (target < 0 || target >= ids.length) return; const next = [...ids]; [next[index], next[target]] = [next[target], next[index]]; setIds(next); };
  return <div className="mt-8 max-w-4xl"><p className="text-sm text-[var(--muted)]">Select published Research cards and arrange their public order. Changes are saved to the existing homepage draft.</p><form action={saveAction} className="mt-6"><input type="hidden" name="revision" value={revision} /><input type="hidden" name="ids" value={ids.join(",")} /><div className="grid gap-6 md:grid-cols-2"><section className="border bg-white p-4"><h2 className="serif text-2xl">Selected cards ({selected.length})</h2><div className="mt-4 space-y-2">{selected.length === 0 && <p className="text-sm text-[var(--muted)]">No cards selected.</p>}{selected.map((item, index) => <div className="flex items-center gap-2 border p-2" key={item.id}><span className="min-w-0 flex-1 text-sm">{index + 1}. {item.title}</span><button className="border px-2 py-1 text-xs" type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${item.title} up`}>↑</button><button className="border px-2 py-1 text-xs" type="button" onClick={() => move(index, 1)} disabled={index === selected.length - 1} aria-label={`Move ${item.title} down`}>↓</button><button className="border px-2 py-1 text-xs" type="button" onClick={() => toggle(item.id)}>Remove</button></div>)}</div></section><section className="border bg-white p-4"><h2 className="serif text-2xl">Published Research</h2><div className="mt-4 space-y-2">{candidates.map((item) => <label className="flex items-start gap-2 border p-2 text-sm" key={item.id}><input type="checkbox" checked={ids.includes(item.id)} onChange={() => toggle(item.id)} />{item.title}</label>)}</div></section></div><button className="mt-6 bg-[var(--orange)] px-4 py-3 font-bold text-white" type="submit">Save Explore Research draft</button></form></div>;
}
