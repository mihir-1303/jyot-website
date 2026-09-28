"use client";

import { useEffect, useRef, useState } from "react";
import { MediaPicker, type MediaPickerAsset } from "./MediaPicker";

export type ArticleMediaPlacement = "hero" | "inline";

const placements: { value: ArticleMediaPlacement; label: string; description: string; guidance: string }[] = [
  { value: "hero", label: "Hero image", description: "Displayed at the top of the published article.", guidance: "Recommended: 16:9, 1600px wide or larger." },
  { value: "inline", label: "Inline image", description: "Inserted directly inside the article body at the current cursor position.", guidance: "Use the original aspect ratio. Recommended width: 1200px or larger; it will display within the article content column." },
];

export function InsertMediaModal({ open, onClose, onInsert }: { open: boolean; onClose: () => void; onInsert: (placement: ArticleMediaPlacement, asset: MediaPickerAsset) => void }) {
  const [step, setStep] = useState<"placement" | "library">("placement");
  const [placement, setPlacement] = useState<ArticleMediaPlacement | null>(null);
  const [asset, setAsset] = useState<MediaPickerAsset | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const first = dialogRef.current?.querySelector<HTMLElement>("input, button");
    first?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button, input, [href], select, textarea, [tabindex]:not([tabindex='-1'])")].filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const firstFocusable = focusable[0]; const lastFocusable = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstFocusable) { event.preventDefault(); lastFocusable.focus(); }
      else if (!event.shiftKey && document.activeElement === lastFocusable) { event.preventDefault(); firstFocusable.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  const selectedPlacement = placements.find((item) => item.value === placement);
  return <div className="cms-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="cms-modal" role="dialog" aria-modal="true" aria-labelledby="insert-media-title" ref={dialogRef}>
      <div className="cms-modal-header"><div><p className="eyebrow">Article media</p><h2 id="insert-media-title" className="serif">Insert Media</h2></div><button type="button" className="cms-modal-close" onClick={onClose} aria-label="Close Insert Media">×</button></div>
      {step === "placement" ? <>
        <p className="cms-modal-intro">Choose an image from your Media Library and select where it should appear in this article.</p>
        <fieldset className="cms-media-placement-list"><legend className="cms-modal-label">Where should this image appear?</legend>{placements.map((item) => <label className={`cms-media-placement ${placement === item.value ? "cms-media-placement-selected" : ""}`} key={item.value}><input type="radio" name="article-media-placement" value={item.value} checked={placement === item.value} onChange={() => setPlacement(item.value)} /><span><strong>{item.label}</strong><small>{item.description}</small><em>{item.guidance}</em></span></label>)}</fieldset>
        <div className="cms-modal-actions"><button type="button" className="media-secondary-button" onClick={onClose}>Cancel</button><button type="button" className="media-primary-button" disabled={!placement} onClick={() => setStep("library")}>Continue</button></div>
      </> : <>
        <div className="cms-media-modal-context"><span>Placement: <strong>{selectedPlacement?.label}</strong></span><button type="button" onClick={() => setStep("placement")}>Change placement</button></div>
        {placement === "inline" && <p className="cms-media-inline-note">Inline image will be inserted at the current cursor position.</p>}
        <MediaPicker name="mediaModalSelection" initialValue={asset?._id ?? ""} onAssetSelect={setAsset} />
        {asset && <div className="cms-media-selected-preview" aria-live="polite"><strong>Selected: {asset.originalName}</strong>{asset.width && asset.height && <span>{asset.width} × {asset.height}</span>}</div>}
        <div className="cms-modal-actions"><button type="button" className="media-secondary-button" onClick={onClose}>Cancel</button><button type="button" className="media-primary-button" disabled={!asset || !placement} onClick={() => asset && placement && onInsert(placement, asset)}>Insert Image</button></div>
      </>}
    </div>
  </div>;
}
