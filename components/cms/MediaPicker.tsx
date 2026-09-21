"use client";

import { useEffect, useState } from "react";
import { EditorialImage } from "../EditorialImage";

type Asset = { _id: string; originalName: string; mimeType: string; width?: number; height?: number; url?: string; altText?: string };

export function MediaPicker({ name, initialValue = "", onAssetSelect }: { name: string; initialValue?: string; onAssetSelect?: (asset: Asset) => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState(initialValue);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try { const response = await fetch(`/api/admin/media?search=${encodeURIComponent(search)}`, { signal: controller.signal }); if (!response.ok) throw new Error("load"); setAssets(await response.json() as Asset[]); } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setStatus("Media could not be loaded."); }
    }, 150);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [search]);

  function select(asset: Asset) { setSelected(asset._id); onAssetSelect?.(asset); setStatus(""); }

  async function upload(file: File) {
    setUploading(true); setStatus(""); const form = new FormData(); form.append("file", file); form.append("altText", file.name);
    try { const response = await fetch("/api/admin/media", { method: "POST", body: form }); if (!response.ok) throw new Error("upload"); setStatus("Upload complete. Search or select the new asset below."); setSearch(file.name); } catch { setStatus("Upload failed. Check the file type and size."); } finally { setUploading(false); }
  }

  const current = assets.find((asset) => asset._id === selected);
  return <div className="media-picker"><input type="hidden" name={name} value={selected} /><div className="media-picker-heading"><p className="eyebrow">Choose media</p>{selected && <button type="button" className="media-picker-clear" onClick={() => { setSelected(""); setStatus(""); }}>Clear selection</button>}</div><input className="media-picker-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search filename or alt text" aria-label="Search media" /><div className="media-picker-grid">{assets.map((asset) => <button type="button" className={`media-picker-item ${asset._id === selected ? "media-picker-item-selected" : ""}`} aria-pressed={asset._id === selected} onClick={() => select(asset)} key={asset._id}>{asset.url && asset.mimeType.startsWith("image/") ? <EditorialImage src={asset.url} alt={asset.altText ?? asset.originalName} /> : <span className="media-picker-file">{asset.mimeType === "application/pdf" ? "PDF" : "FILE"}</span>}<span className="media-picker-name">{asset.originalName}</span>{asset._id === selected && <span className="media-picker-selected">Selected</span>}</button>)}</div>{!assets.length && <p className="media-picker-empty">No matching media.</p>}{name && <label className="media-picker-upload">{uploading ? "Uploading…" : "Upload new media"}<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /></label>}{current && <p className="media-picker-info">{current.width && current.height ? `${current.width} × ${current.height}` : current.mimeType} · {current.altText || "No alt text"}</p>}{status && <p className="media-picker-status" role="status">{status}</p>}</div>;
}
