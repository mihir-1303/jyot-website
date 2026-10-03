"use client";

import { useEffect, useRef } from "react";

type Props = { open: boolean; title: string; message: string; confirmLabel: string; onClose: () => void; onConfirm: () => void; danger?: boolean };

export function ConfirmationModal({ open, title, message, confirmLabel, onClose, onConfirm, danger = false }: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => confirmRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } };
    document.addEventListener("keydown", onKeyDown);
    return () => { window.clearTimeout(timer); document.removeEventListener("keydown", onKeyDown); };
  }, [open, onClose]);

  if (!open) return null;
  return <div className="cms-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="cms-modal" role="dialog" aria-modal="true" aria-labelledby="cms-confirmation-title">
      <div className="cms-modal-header"><div><p className="eyebrow">Confirmation</p><h2 id="cms-confirmation-title" className="serif">{title}</h2></div><button type="button" className="cms-modal-close" onClick={onClose} aria-label="Close confirmation">×</button></div>
      <p className="cms-modal-intro">{message}</p>
      <div className="cms-modal-actions"><button type="button" className="media-secondary-button" onClick={onClose}>Cancel</button><button ref={confirmRef} type="button" className={danger ? "media-delete-button" : "media-primary-button"} onClick={onConfirm}>{confirmLabel}</button></div>
    </div>
  </div>;
}
