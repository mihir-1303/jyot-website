"use client";

import { useState } from "react";
import { createCategory } from "../../lib/cms/category-actions";
import { normalizeCmsError } from "../../lib/cms/form-errors";
import { FieldError } from "./FormFeedback";

type Option = { id: string; name: string };

export function ResearchTopicPicker({ options: initialOptions, value, error }: { options: Option[]; value: string; error?: string }) {
  const [options, setOptions] = useState(initialOptions);
  const [selected, setSelected] = useState(value);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const errorId = "error-category";

  const closeModal = () => { setModalOpen(false); setName(""); setCreateError(""); };
  const createTopic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true); setCreateError("");
    try {
      const topic = await createCategory(name);
      setOptions((current) => [...current, topic].sort((a, b) => a.name.localeCompare(b.name)));
      setSelected(topic.id);
      closeModal();
    } catch (cause) {
      setCreateError(normalizeCmsError(cause, "We could not create this category right now."));
    } finally { setCreating(false); }
  };

  return <div className="research-topic-picker">
    <label className="block text-sm">Research Category<span aria-hidden="true" className="required-mark">*</span>
      <select className="mt-1 w-full border p-3" name="category" value={selected} onChange={(event) => setSelected(event.target.value)} required aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}>
        <option value="">Select category</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </label>
    <p className="mt-1 text-xs text-[var(--muted)]">Choose the shared category for this research. It determines where it appears in Explore Research.</p>
    <FieldError id={errorId} message={error} />
    <button className="mt-2 text-sm font-bold text-[var(--orange)] underline" type="button" onClick={() => { setModalOpen(true); setCreateError(""); }}>+ Create new category</button>
    {modalOpen && <div className="cms-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <div className="cms-modal" role="dialog" aria-modal="true" aria-labelledby="create-research-topic-title">
        <h2 id="create-research-topic-title" className="serif text-2xl">Create category</h2>
        <form className="mt-5 space-y-4" onSubmit={createTopic}>
          <label className="block text-sm">Category name<input className="mt-1 w-full border p-3" autoFocus value={name} onChange={(event) => setName(event.target.value)} required /></label>
          {createError && <p className="cms-form-error" role="alert">{createError}</p>}
          <div className="flex justify-end gap-2"><button className="border px-4 py-2" type="button" onClick={closeModal} disabled={creating}>Cancel</button><button className="bg-[var(--orange)] px-4 py-2 font-bold text-white" type="submit" disabled={creating}>{creating ? "Creating..." : "Create category"}</button></div>
        </form>
      </div>
    </div>}
  </div>;
}
