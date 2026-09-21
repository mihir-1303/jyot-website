"use client";

import { useEffect, useState } from "react";
import { EditorialImage } from "../EditorialImage";

type Asset = { _id: string; originalName: string; mimeType: string; width?: number; height?: number; size: number; altText?: string; caption?: string; url?: string; createdAt?: string | Date; usageCount?: number };
type Filter = "all" | "images" | "other";

const formatBytes = (bytes: number) => { if (!bytes) return "—"; const units = ["B", "KB", "MB", "GB"]; const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`; };
const isImage = (asset: Asset) => asset.mimeType.startsWith("image/");

export function MediaLibrary({ initialItems }: { initialItems: Asset[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [detailAlt, setDetailAlt] = useState("");
  const [detailCaption, setDetailCaption] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const type = filter === "all" ? "" : `&type=${filter}`;
        const response = await fetch(`/api/admin/media?search=${encodeURIComponent(query)}${type}&includeUsage=true`, { signal: controller.signal });
        if (!response.ok) throw new Error("load");
        setItems(await response.json() as Asset[]);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setStatus({ kind: "error", text: "Media could not be loaded." });
      } finally { setLoading(false); }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filter, query]);

  function openDetails(asset: Asset) { setSelected(asset); setDetailAlt(asset.altText ?? ""); setDetailCaption(asset.caption ?? ""); setStatus(null); }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uploadFile || !altText.trim()) { setStatus({ kind: "error", text: "Choose a file and provide alt text before uploading." }); return; }
    setUploading(true); setStatus(null);
    const form = new FormData(); form.append("file", uploadFile); form.append("altText", altText.trim());
    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      if (!response.ok) throw new Error("upload");
      setUploadFile(null); setAltText(""); setStatus({ kind: "success", text: "Media uploaded successfully." });
      setQuery((value) => value);
      const refreshed = await fetch(`/api/admin/media?search=${encodeURIComponent(query)}${filter === "all" ? "" : `&type=${filter}`}&includeUsage=true`);
      if (refreshed.ok) setItems(await refreshed.json() as Asset[]);
    } catch { setStatus({ kind: "error", text: "Upload failed. Check the file type, size, and alt text." }); } finally { setUploading(false); }
  }

  async function saveDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return;
    setSaving(true); setStatus(null); const form = new FormData(); form.append("id", selected._id); form.append("altText", detailAlt); form.append("caption", detailCaption);
    try {
      const response = await fetch("/api/admin/media", { method: "PATCH", body: form });
      if (!response.ok) throw new Error("save");
      const next = { ...selected, altText: detailAlt, caption: detailCaption }; setSelected(next); setItems((current) => current.map((item) => item._id === next._id ? next : item)); setStatus({ kind: "success", text: "Media metadata saved." });
    } catch { setStatus({ kind: "error", text: "Media metadata could not be saved." }); } finally { setSaving(false); }
  }

  async function removeSelected() {
    if (!selected || selected.usageCount) return;
    if (!window.confirm(`Delete “${selected.originalName}”? This cannot be undone.`)) return;
    setStatus(null);
    try { const response = await fetch(`/api/admin/media?id=${encodeURIComponent(selected._id)}`, { method: "DELETE" }); if (!response.ok) throw new Error("delete"); setItems((current) => current.filter((item) => item._id !== selected._id)); setSelected(null); setStatus({ kind: "success", text: "Media deleted." }); } catch { setStatus({ kind: "error", text: "This media could not be deleted. It may still be in use." }); }
  }

  return <div className="media-library">
    <div className="media-library-toolbar"><div><p className="eyebrow">CMS · Assets</p><h1 className="serif media-library-title">Media Library</h1><p className="media-library-intro">Upload, inspect and manage the images and files used across Jyot.</p></div><form className="media-upload" onSubmit={handleUpload}><label className="media-file-label">{uploadFile ? uploadFile.name : "Choose file"}<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} /></label><input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Alt text" aria-label="Alt text" required /><button type="submit" className="media-primary-button" disabled={uploading}>{uploading ? "Uploading…" : "Upload"}</button></form></div>
    <div className="media-library-controls"><label className="media-search"><span className="sr-only">Search media</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search filename, alt text or caption" /></label><div className="media-filters" aria-label="Media type filters">{(["all", "images", "other"] as Filter[]).map((value) => <button type="button" className={filter === value ? "media-filter-active" : ""} onClick={() => setFilter(value)} key={value}>{value === "all" ? "All" : value === "images" ? "Images" : "Other files"}</button>)}</div></div>
    {status && <p className={`media-status media-status-${status.kind}`} role="status">{status.text}</p>}
    {loading && <p className="media-library-note">Loading media…</p>}
    {!loading && items.length === 0 && <p className="media-library-empty">{query ? "No media matches this search." : "No media has been uploaded yet."}</p>}
    <div className="media-grid">{items.map((asset) => <button type="button" className={`media-tile ${selected?._id === asset._id ? "media-tile-selected" : ""}`} onClick={() => openDetails(asset)} key={asset._id}><span className="media-tile-preview">{isImage(asset) && asset.url ? <EditorialImage src={asset.url} alt={asset.altText ?? asset.originalName} /> : <span className="media-file-preview">{asset.mimeType === "application/pdf" ? "PDF" : "FILE"}</span>}</span><span className="media-tile-name">{asset.originalName}</span><span className="media-tile-meta">{asset.mimeType} · {formatBytes(asset.size)}{asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}</span>{asset.usageCount ? <span className="media-usage">In use · {asset.usageCount}</span> : <span className="media-unused">Unused</span>}</button>)}</div>
    {selected && <aside className="media-details" aria-label="Media details"><div className="media-details-header"><div><p className="eyebrow">Asset details</p><h2 className="serif">{selected.originalName}</h2></div><button type="button" className="media-close" onClick={() => setSelected(null)} aria-label="Close media details">×</button></div>{isImage(selected) && selected.url ? <EditorialImage src={selected.url} alt={selected.altText ?? selected.originalName} /> : <div className="media-detail-file-preview">{selected.mimeType}</div>}<dl className="media-detail-list"><div><dt>Type</dt><dd>{selected.mimeType}</dd></div><div><dt>Dimensions</dt><dd>{selected.width && selected.height ? `${selected.width} × ${selected.height}` : "Not available"}</dd></div><div><dt>Size</dt><dd>{formatBytes(selected.size)}</dd></div><div><dt>Uploaded</dt><dd>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Not available"}</dd></div><div><dt>Usage</dt><dd>{selected.usageCount ? `Used in ${selected.usageCount} record${selected.usageCount === 1 ? "" : "s"}` : "Not currently referenced"}</dd></div>{selected.url && <div><dt>Delivery URL</dt><dd className="media-url">{selected.url}</dd></div>}</dl><form className="media-detail-form" onSubmit={saveDetails}><label>Alt text<input value={detailAlt} onChange={(event) => setDetailAlt(event.target.value)} /></label><label>Caption<input value={detailCaption} onChange={(event) => setDetailCaption(event.target.value)} /></label><button type="submit" className="media-secondary-button" disabled={saving}>{saving ? "Saving…" : "Save metadata"}</button></form><button type="button" className="media-delete-button" disabled={Boolean(selected.usageCount)} onClick={() => void removeSelected()}>{selected.usageCount ? "In use — cannot delete" : "Delete unused media"}</button></aside>}
  </div>;
}
