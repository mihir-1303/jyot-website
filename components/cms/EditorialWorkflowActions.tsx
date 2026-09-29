"use client";

import { useEffect, useRef, useState } from "react";

type Props = { action: (formData: FormData) => Promise<unknown>; label?: string; initialStatus?: string };
type WorkflowChoice = "review" | "scheduled" | "published" | "archived";
type WorkflowOption = { value: WorkflowChoice; label: string; description: string };

const choices: WorkflowOption[] = [
  { value: "scheduled", label: "Schedule publication", description: "Choose when this content should publish." },
  { value: "review", label: "Submit for review", description: "Send this content for editorial review." },
  { value: "archived", label: "Archive", description: "Remove this content from active content." },
];

export function EditorialWorkflowActions({ action, label = "article", initialStatus = "draft" }: Props) {
  const [choice, setChoice] = useState<WorkflowChoice | "">("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [status, setCurrentStatus] = useState(initialStatus);
  const formRef = useRef<HTMLFormElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutsideClick); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  const setStatus = (next: string) => {
    setCurrentStatus(next);
    formRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name="status"]').forEach((field) => { field.value = next; });
  };
  const submit = async (next: "draft" | WorkflowChoice) => {
    if (!formRef.current || pending) return;
    if (next === "archived" && !(formRef.current.elements.namedItem("archiveReason") as HTMLSelectElement | null)?.value) { setError("Select an archive reason first."); return; }
    if (next === "scheduled" && !(formRef.current.elements.namedItem("scheduledLocal") as HTMLInputElement | null)?.value) { setError("Choose a publication date and time."); return; }
    setStatus(next); setPending(true); setMenuOpen(false);
    try {
      await action(new FormData(formRef.current));
      const name = label[0].toUpperCase() + label.slice(1);
      setFeedback(next === "draft" ? "Draft saved." : next === "review" ? `${name} submitted for review.` : next === "scheduled" ? "Publishing scheduled." : next === "archived" ? `${name} archived.` : `${name} published.`);
      setChoice("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to complete this workflow action."); }
    finally { setPending(false); }
  };
  const choose = (next: WorkflowChoice) => {
    setChoice(next); setError(""); setFeedback(""); setMenuOpen(false);
    if (next === "published") {
      if (window.confirm(`Publish ${label}?\n\nThis will make the ${label} publicly available.`)) void submit(next);
      return;
    }
  };
  const selected = choices.find((item) => item.value === choice);

  return <section className="editorial-workflow-panel" aria-labelledby="editorial-workflow-title">
    <input ref={(node) => { formRef.current = node?.form ?? null; }} type="hidden" name="status" defaultValue={initialStatus} />
    <div className="editorial-workflow-header"><div><p className="eyebrow">Publishing</p><h2 id="editorial-workflow-title" className="serif">Publishing</h2></div><span className={`admin-status admin-status-${status}`}><span aria-hidden="true">●</span> {status}</span></div>
    <div className="editorial-workflow-control"><label htmlFor="editorial-workflow-trigger">Action</label><div className="editorial-workflow-menu" ref={menuRef}><button ref={triggerRef} id="editorial-workflow-trigger" type="button" className="editorial-workflow-trigger" aria-haspopup="menu" aria-expanded={menuOpen} disabled={pending} onClick={() => setMenuOpen((open) => !open)}><span>{selected?.label ?? "Choose action"}</span><span aria-hidden="true">▾</span></button>{menuOpen && <div className="editorial-workflow-menu-list" role="menu">{choices.map((item) => <button type="button" role="menuitemradio" aria-checked={choice === item.value} className={choice === item.value ? "is-selected" : ""} key={item.value} onClick={() => choose(item.value)}><span className="editorial-workflow-menu-check" aria-hidden="true">{choice === item.value ? "✓" : ""}</span><span><strong>{item.label}</strong><small>{item.description.replace("this content", `this ${label}`)}</small></span></button>)}</div>}</div></div>
    {choice === "scheduled" && <div className="editorial-workflow-schedule"><label>Publication date<input name="scheduledLocal" type="datetime-local" /></label><input type="hidden" name="scheduledTimezone" value="Asia/Kolkata" /><p>Times are interpreted in India Standard Time.</p><button type="button" className="media-primary-button" disabled={pending} onClick={() => void submit("scheduled")}>{pending ? "Scheduling..." : "Schedule"}</button></div>}
    {choice === "review" && <div className="editorial-workflow-detail"><label>Review notes<textarea name="reviewNotes" maxLength={5000} placeholder="Add notes for the reviewer" /></label><div className="editorial-workflow-actions"><button type="button" className="media-secondary-button" disabled={pending} onClick={() => setChoice("")}>Cancel</button><button type="button" className="media-primary-button" disabled={pending} onClick={() => void submit("review")}>{pending ? "Submitting..." : "Submit for review"}</button></div></div>}
    {choice === "archived" && <div className="editorial-workflow-detail"><label>Archive reason<select name="archiveReason" defaultValue=""><option value="">Select a reason</option><option>Outdated</option><option>Duplicate</option><option>No longer relevant</option><option>Editorial decision</option><option>Incorrect information</option><option>Other</option></select></label><label>Archive notes<textarea name="archiveNotes" maxLength={5000} placeholder="Add optional notes" /></label><div className="editorial-workflow-actions"><button type="button" className="media-secondary-button" disabled={pending} onClick={() => setChoice("")}>Cancel</button><button type="button" className="media-primary-button" disabled={pending} onClick={() => void submit("archived")}>{pending ? "Archiving..." : `Archive ${label[0].toUpperCase() + label.slice(1)}`}</button></div></div>}
    <div className="editorial-workflow-footer"><button type="button" className="media-primary-button" disabled={pending} onClick={() => choose("published")}>Publish</button></div>
    {feedback && <p className="editorial-workflow-feedback" role="status">{feedback}</p>}{error && <p className="editorial-workflow-error" role="alert">{error}</p>}
  </section>;
}
