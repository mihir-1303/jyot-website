"use client";
/* eslint-disable @next/next/no-img-element */

import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor, type NodeViewProps } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect, useRef, useState } from "react";
import { MediaPicker } from "./MediaPicker";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
const sizes = [{ value: "small", label: "Small", detail: "25%" }, { value: "medium", label: "Medium", detail: "50%" }, { value: "large", label: "Large", detail: "75%" }, { value: "full", label: "Full", detail: "100%" }] as const;
const alignments = [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] as const;
type ImageSize = typeof sizes[number]["value"];
type ImageAlign = typeof alignments[number]["value"];
type ImageAttrs = { src?: string; alt?: string; title?: string; mediaId?: string; width?: number | null; size?: ImageSize | null; align?: ImageAlign | null };
type MediaMeta = { name: string; width?: number; height?: number };

function normalizeContent(value: unknown) { if (value && typeof value === "object") return value; if (typeof value === "string" && value.trim()) { try { return JSON.parse(value); } catch { return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] }; } } return emptyDoc; }
function validSize(value: unknown): ImageSize | null { return sizes.some((item) => item.value === value) ? value as ImageSize : null; }
function validAlign(value: unknown): ImageAlign { return alignments.some((item) => item.value === value) ? value as ImageAlign : "center"; }
function clampWidth(value: number) { return Math.min(100, Math.max(20, Math.round(value))); }
function widthFromAttrs(attrs: ImageAttrs) { if (typeof attrs.width === "number" && Number.isFinite(attrs.width)) return clampWidth(attrs.width); return ({ small: 25, medium: 50, large: 75, full: 100 } as Record<string, number>)[attrs.size ?? "large"] ?? 75; }

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const attrs = node.attrs as ImageAttrs;
  const width = widthFromAttrs(attrs);
  const align = validAlign(attrs.align);
  const start = useRef<{ x: number; width: number; contentWidth: number; side: "left" | "right" } | null>(null);
  const beginResize = (event: React.PointerEvent<HTMLButtonElement>, side: "left" | "right") => {
    event.preventDefault(); event.stopPropagation();
    const image = event.currentTarget.parentElement?.querySelector("img");
    const contentWidth = image?.closest(".ProseMirror")?.getBoundingClientRect().width ?? 1;
    start.current = { x: event.clientX, width, contentWidth, side };
    setResizing(true); event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const state = start.current;
      if (!state) return;
      const direction = state.side === "right" ? 1 : -1;
      updateAttributes({ width: clampWidth(state.width + ((event.clientX - state.x) * direction / state.contentWidth) * 100), size: null });
    };
    const end = () => { start.current = null; setResizing(false); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
  }, [start, updateAttributes]);
  return <NodeViewWrapper className={`rich-editor-image-node rich-editor-image-node-align-${align} ${selected ? "is-selected" : ""} ${resizing ? "is-resizing" : ""}`} style={{ width: `${width}%` }}>
    <img ref={imageRef} className="rich-editor-node-image" src={String(attrs.src ?? "")} alt={String(attrs.alt ?? "")} title={attrs.title ? String(attrs.title) : undefined} draggable={false} />
    {selected && <><button className="rich-editor-resize-handle rich-editor-resize-handle-left" type="button" aria-label="Resize image from left edge" onPointerDown={(event) => beginResize(event, "left")} /><button className="rich-editor-resize-handle rich-editor-resize-handle-right" type="button" aria-label="Resize image from right edge" onPointerDown={(event) => beginResize(event, "right")} /></>}
  </NodeViewWrapper>;
}

const EditorialImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: { default: null },
      width: { default: null, parseHTML: (element: HTMLElement) => { const value = Number(element.getAttribute("data-image-width")); return Number.isFinite(value) ? clampWidth(value) : null; }, renderHTML: (attributes: ImageAttrs) => typeof attributes.width === "number" ? { "data-image-width": clampWidth(attributes.width) } : {} },
      size: { default: null, parseHTML: (element: HTMLElement) => validSize(element.getAttribute("data-image-size")), renderHTML: (attributes: ImageAttrs) => attributes.size ? { "data-image-size": attributes.size, class: `rich-editor-image rich-editor-image-${attributes.size}` } : { class: "rich-editor-image rich-editor-image-auto" } },
      align: { default: "center", parseHTML: (element: HTMLElement) => validAlign(element.getAttribute("data-image-align")), renderHTML: (attributes: ImageAttrs) => ({ "data-image-align": validAlign(attributes.align), class: `rich-editor-align-${validAlign(attributes.align)}` }) },
    };
  },
  addNodeView() { return ReactNodeViewRenderer(ResizableImageView); },
});

type ToolbarButton = { label: string; active?: () => boolean; enabled: () => boolean; run: () => void };

function ImageControls({ editor, metadata }: { editor: ReturnType<typeof useEditor>; metadata: MediaMeta | null }) {
  if (!editor || !editor.isActive("image")) return null;
  const attrs = editor.getAttributes("image") as ImageAttrs;
  const activeWidth = widthFromAttrs(attrs);
  const activeAlign = validAlign(attrs.align);
  const update = (attributes: Partial<ImageAttrs>) => editor.chain().focus().updateAttributes("image", attributes).run();
  const keepSelection = (event: React.MouseEvent) => event.preventDefault();
  return <aside className="rich-image-controls" aria-label="Selected image controls">
    <div className="rich-image-controls-heading"><div><strong>Image</strong>{metadata?.name && <span>{metadata.name}</span>}</div><span className="rich-image-selected-label">Selected</span></div>
    {metadata?.width && metadata.height && <p className="rich-image-metadata">{metadata.width} × {metadata.height}</p>}
    <div className="rich-image-control-group"><span>Width</span><div className="rich-image-control-buttons">{sizes.map((item) => { const percentage = Number.parseInt(item.detail, 10); return <button key={item.value} type="button" className={activeWidth === percentage ? "is-active" : ""} aria-pressed={activeWidth === percentage} onMouseDown={keepSelection} onClick={() => update({ width: percentage, size: item.value })}>{item.detail}</button>; })}</div></div>
    <div className="rich-image-control-group"><span>Alignment</span><div className="rich-image-control-buttons">{alignments.map((item) => <button key={item.value} type="button" className={activeAlign === item.value ? "is-active" : ""} aria-pressed={activeAlign === item.value} onMouseDown={keepSelection} onClick={() => update({ align: item.value })}>{item.label}</button>)}</div></div>
    <div className="rich-image-controls-footer"><span>Width: {activeWidth}%</span><button type="button" onMouseDown={keepSelection} onClick={() => update({ width: 75, size: "large", align: "center" })}>Reset size</button></div>
  </aside>;
}

export function RichTextEditor({ name, initialValue, onDirty }: { name: string; initialValue?: unknown; onDirty?: () => void }) {
  const initialContent = normalizeContent(initialValue); const [value, setValue] = useState(JSON.stringify(initialContent)); const [, refreshToolbar] = useState(0); const [selectedMedia, setSelectedMedia] = useState<MediaMeta | null>(null);
  const editor = useEditor({ extensions: [StarterKit.configure({ link: { openOnClick: false, protocols: ["http", "https", "mailto", "tel"] }, underline: {} }), EditorialImage.configure({ inline: false, allowBase64: false })], content: initialContent, immediatelyRender: false, onTransaction: () => refreshToolbar((current) => current + 1), onUpdate: ({ editor: current }) => { setValue(JSON.stringify(current.getJSON())); onDirty?.(); } });
  useEffect(() => { const handler = (event: BeforeUnloadEvent) => { if (value !== JSON.stringify(initialContent)) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [initialContent, value]);
  if (!editor) return <div className="border p-4">Loading editor…</div>;
  const buttons: ToolbarButton[] = [
    { label: "Bold", active: () => editor.isActive("bold"), enabled: () => editor.can().chain().toggleBold().run(), run: () => { editor.chain().focus().toggleBold().run(); } },
    { label: "Italic", active: () => editor.isActive("italic"), enabled: () => editor.can().chain().toggleItalic().run(), run: () => { editor.chain().focus().toggleItalic().run(); } },
    { label: "Underline", active: () => editor.isActive("underline"), enabled: () => editor.can().chain().toggleUnderline().run(), run: () => { editor.chain().focus().toggleUnderline().run(); } },
    { label: "Paragraph", active: () => editor.isActive("paragraph"), enabled: () => editor.can().chain().setParagraph().run(), run: () => { editor.chain().focus().setParagraph().run(); } },
    { label: "H1", active: () => editor.isActive("heading", { level: 1 }), enabled: () => editor.can().chain().toggleHeading({ level: 1 }).run(), run: () => { editor.chain().focus().toggleHeading({ level: 1 }).run(); } },
    { label: "H2", active: () => editor.isActive("heading", { level: 2 }), enabled: () => editor.can().chain().toggleHeading({ level: 2 }).run(), run: () => { editor.chain().focus().toggleHeading({ level: 2 }).run(); } },
    { label: "H3", active: () => editor.isActive("heading", { level: 3 }), enabled: () => editor.can().chain().toggleHeading({ level: 3 }).run(), run: () => { editor.chain().focus().toggleHeading({ level: 3 }).run(); } },
    { label: "• List", active: () => editor.isActive("bulletList"), enabled: () => editor.can().chain().toggleBulletList().run(), run: () => { editor.chain().focus().toggleBulletList().run(); } },
    { label: "1. List", active: () => editor.isActive("orderedList"), enabled: () => editor.can().chain().toggleOrderedList().run(), run: () => { editor.chain().focus().toggleOrderedList().run(); } },
    { label: "Quote", active: () => editor.isActive("blockquote"), enabled: () => editor.can().chain().toggleBlockquote().run(), run: () => { editor.chain().focus().toggleBlockquote().run(); } },
    { label: "Link", active: () => editor.isActive("link"), enabled: () => editor.can().chain().setLink({ href: "https://example.com" }).run(), run: () => { const href = window.prompt("Link URL", editor.getAttributes("link").href ?? "https://"); if (href === null) return; if (href.trim() === "") editor.chain().focus().unsetLink().run(); else editor.chain().focus().setLink({ href: href.trim() }).run(); } },
    { label: "Undo", enabled: () => editor.can().chain().undo().run(), run: () => { editor.chain().focus().undo().run(); } },
    { label: "Redo", enabled: () => editor.can().chain().redo().run(), run: () => { editor.chain().focus().redo().run(); } },
  ];
  const selectMedia = (asset: { _id: string; url?: string; altText?: string; originalName: string; width?: number; height?: number }) => { if (!asset.url) return; editor.chain().focus().setImage({ src: asset.url, alt: asset.altText, title: asset.originalName, mediaId: asset._id, width: 75, size: "large", align: "center" } as never).run(); setSelectedMedia({ name: asset.originalName, width: asset.width, height: asset.height }); };
  return <div className="border bg-white"><div className="flex flex-wrap gap-1 border-b p-2" role="toolbar" aria-label="Formatting tools">{buttons.map((button) => <button className={`border px-2 py-1 text-xs ${button.active?.() ? "bg-[var(--orange)] text-white" : ""}`} type="button" key={button.label} aria-label={button.label} aria-pressed={button.active?.() ?? false} disabled={!button.enabled()} onMouseDown={(event) => event.preventDefault()} onClick={button.run}>{button.label}</button>)}</div><div className="p-4"><EditorContent editor={editor} /><ImageControls editor={editor} metadata={selectedMedia} /></div><div className="border-t p-3"><p className="mb-2 text-xs font-bold uppercase">Insert media</p><MediaPicker name="" onAssetSelect={selectMedia} /></div><input type="hidden" name={name} value={value} /></div>;
}
