"use client";

import type { CmsFieldErrors } from "../../lib/cms/form-errors";

export function FieldError({ message, id }: { message?: string; id?: string }) { return message ? <p id={id} className="cms-field-error" role="alert"><span aria-hidden="true">!</span>{message}</p> : null; }
export function FormErrorSummary({ errors, formError = "Please fix the highlighted fields before continuing." }: { errors: CmsFieldErrors; formError?: string }) {
  const entries = Object.entries(errors); if (!entries.length) return null;
  return <div className="cms-form-error-summary" role="alert" tabIndex={-1}><strong>{formError}</strong><ul>{entries.map(([field, message]) => <li key={field}><button type="button" onClick={() => { const target = document.querySelector<HTMLElement>(`[name="${field}"]`); target?.scrollIntoView({ behavior: "smooth", block: "center" }); window.setTimeout(() => target?.focus(), 250); }}>{message}</button></li>)}</ul></div>;
}
