"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/refs */

import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor, type NodeViewProps } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { MediaPickerAsset } from "./MediaPicker";
import { InsertMediaModal, type ArticleMediaPlacement } from "./InsertMediaModal";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
const sizes = [{ value: "small", label: "Small", detail: "25%" }, { value: "medium", label: "Medium", detail: "50%" }, { value: "large", label: "Large", detail: "75%" }, { value: "full", label: "Full", detail: "100%" }] as const;
const alignments = [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] as const;
type ImageSize = typeof sizes[number]["value"];
type ImageAlign = typeof alignments[number]["value"];
type ImageAttrs = { src?: string; alt?: string; title?: string; mediaId?: string; width?: number | null; size?: ImageSize | null; align?: ImageAlign | null };
type MediaMeta = { name: string; width?: number; height?: number };

function normalizeContent(value: unknown) { if (value && typeof value === "object") return value; if (typeof value === "string" && value.trim()) { try { return JSON.parse(value); } catch { return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] }; } } return emptyDoc; }
function validSize(value: unknown): ImageSize | null { return sizes.some((item) => item.value === value) ? value as ImageSize : null; }
function validAlign(value: unknown): ImageAlign { return alignments.some((item) => item.value === value) ? value as ImageAlign : "left"; }
function clampWidth(value: number) { return Math.min(100, Math.max(20, Math.round(value))); }
function widthFromAttrs(attrs: ImageAttrs) { if (typeof attrs.width === "number" && Number.isFinite(attrs.width)) return clampWidth(attrs.width); return ({ small: 25, medium: 50, large: 75, full: 100 } as Record<string, number>)[attrs.size ?? "large"] ?? 75; }

type ResizeHandle = "top-left" | "top-center" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-center" | "bottom-right";
const resizeDirections: Record<ResizeHandle, { horizontal: 1 | -1 | 0; vertical: 1 | -1 | 0 }> = {
  "top-left": { horizontal: -1, vertical: -1 }, "top-center": { horizontal: 0, vertical: -1 }, "top-right": { horizontal: 1, vertical: -1 },
  "middle-left": { horizontal: -1, vertical: 0 }, "middle-right": { horizontal: 1, vertical: 0 },
  "bottom-left": { horizontal: -1, vertical: 1 }, "bottom-center": { horizontal: 0, vertical: 1 }, "bottom-right": { horizontal: 1, vertical: 1 },
};

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const attrs = node.attrs as ImageAttrs;
  const width = widthFromAttrs(attrs);
  const align = validAlign(attrs.align);
  const start = useRef<{ x: number; y: number; width: number; height: number; contentWidth: number; aspectRatio: number; handle: ResizeHandle; pointerId: number; target: HTMLButtonElement | null } | null>(null);
  const beginResize = (event: React.PointerEvent<HTMLButtonElement>, handle: ResizeHandle) => {
    event.preventDefault(); event.stopPropagation();
    const image = imageRef.current;
    const imageRect = image?.getBoundingClientRect();
    const contentWidth = image?.closest(".ProseMirror")?.getBoundingClientRect().width ?? 1;
    const imageWidth = imageRect?.width ?? contentWidth * (width / 100);
    const imageHeight = imageRect?.height ?? imageWidth;
    start.current = { x: event.clientX, y: event.clientY, width: imageWidth, height: imageHeight, contentWidth, aspectRatio: imageWidth / Math.max(imageHeight, 1), handle, pointerId: event.pointerId, target: event.currentTarget };
    setResizing(true); event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const state = start.current;
      if (!state) return;
      const direction = resizeDirections[state.handle];
      const horizontalDelta = direction.horizontal * (event.clientX - state.x);
      const verticalDelta = direction.vertical * (event.clientY - state.y) * state.aspectRatio;
      const delta = direction.horizontal === 0 ? verticalDelta : direction.vertical === 0 ? horizontalDelta : Math.abs(horizontalDelta) >= Math.abs(verticalDelta) ? horizontalDelta : verticalDelta;
      const nextWidth = Math.max(160, Math.min(state.contentWidth, state.width + delta));
      updateAttributes({ width: clampWidth((nextWidth / state.contentWidth) * 100), size: null });
    };
    const end = () => {
      const state = start.current;
      if (state?.target?.hasPointerCapture?.(state.pointerId)) state.target.releasePointerCapture(state.pointerId);
      start.current = null;
      setResizing(false);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); window.removeEventListener("pointercancel", end); };
  }, [updateAttributes]);
  return <NodeViewWrapper className={`rich-editor-image-node rich-editor-image-node-align-${align} ${selected ? "is-selected" : ""} ${resizing ? "is-resizing" : ""}`} style={{ width: `${width}%` }}>
    <img ref={imageRef} className="rich-editor-node-image" src={String(attrs.src ?? "")} alt={String(attrs.alt ?? "")} title={attrs.title ? String(attrs.title) : undefined} draggable={false} />
    {selected && <>
      {(Object.keys(resizeDirections) as ResizeHandle[]).map((handle) => <button key={handle} className={`rich-editor-resize-handle rich-editor-resize-handle-${handle}`} type="button" aria-label={`Resize image from ${handle.replace("-", " ")}`} onPointerDown={(event) => beginResize(event, handle)} />)}
    </>}
  </NodeViewWrapper>;
}

const EditorialImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: { default: null },
      width: { default: null, parseHTML: (element: HTMLElement) => { const value = Number(element.getAttribute("data-image-width")); return Number.isFinite(value) ? clampWidth(value) : null; }, renderHTML: (attributes: ImageAttrs) => typeof attributes.width === "number" ? { "data-image-width": clampWidth(attributes.width) } : {} },
      size: { default: null, parseHTML: (element: HTMLElement) => validSize(element.getAttribute("data-image-size")), renderHTML: (attributes: ImageAttrs) => attributes.size ? { "data-image-size": attributes.size, class: `rich-editor-image rich-editor-image-${attributes.size}` } : { class: "rich-editor-image rich-editor-image-auto" } },
      align: { default: "left", parseHTML: (element: HTMLElement) => validAlign(element.getAttribute("data-image-align")), renderHTML: (attributes: ImageAttrs) => ({ "data-image-align": validAlign(attributes.align), class: `rich-editor-align-${validAlign(attributes.align)}` }) },
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
    <div className="rich-image-controls-footer"><span>Width: {activeWidth}%</span><button type="button" onMouseDown={keepSelection} onClick={() => update({ width: 75, size: "large", align: "left" })}>Reset size</button></div>
  </aside>;
}

export type RichTextEditorHandle = { requestMedia: () => void };
type RichTextEditorProps = { name: string; initialValue?: unknown; onDirty?: () => void; onImageCountChange?: (count: number) => void };

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor({ name, initialValue, onDirty, onImageCountChange }, ref) {
  const initialContent = normalizeContent(initialValue); const [value, setValue] = useState(JSON.stringify(initialContent)); const [, refreshToolbar] = useState(0); const [selectedMedia, setSelectedMedia] = useState<MediaMeta | null>(null); const [mediaModalOpen, setMediaModalOpen] = useState(false); const savedSelection = useRef<{ from: number; to: number } | null>(null);
  const editor = useEditor({ extensions: [StarterKit.configure({ link: { openOnClick: false, protocols: ["http", "https", "mailto", "tel"] }, underline: {} }), EditorialImage.configure({ inline: false, allowBase64: false })], content: initialContent, immediatelyRender: false, onTransaction: () => refreshToolbar((current) => current + 1), onUpdate: ({ editor: current }) => { const json = current.getJSON(); setValue(JSON.stringify(json)); onImageCountChange?.(countImages(json)); onDirty?.(); } });
  useEffect(() => { const handler = (event: BeforeUnloadEvent) => { if (value !== JSON.stringify(initialContent)) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [initialContent, value]);
  const requestInlineMedia = useCallback(() => {
    if (!editor) return;
    savedSelection.current = { from: editor.state.selection.from, to: editor.state.selection.to }; setMediaModalOpen(true);
  }, [editor]);
  useImperativeHandle(ref, () => ({ requestMedia: requestInlineMedia }), [requestInlineMedia]);
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
    { label: "Image", enabled: () => true, run: requestInlineMedia },
    { label: "Undo", enabled: () => editor.can().chain().undo().run(), run: () => { editor.chain().focus().undo().run(); } },
    { label: "Redo", enabled: () => editor.can().chain().redo().run(), run: () => { editor.chain().focus().redo().run(); } },
  ];
  const insertInlineImage = (_placement: ArticleMediaPlacement, asset: MediaPickerAsset) => { if (!asset.url) return; const selection = savedSelection.current ?? { from: editor.state.selection.from, to: editor.state.selection.to }; editor.chain().setTextSelection(selection).focus().setImage({ src: asset.url, alt: asset.altText, title: asset.originalName, mediaId: asset._id, width: 75, size: "large", align: "left" } as never).run(); setSelectedMedia({ name: asset.originalName, width: asset.width, height: asset.height }); savedSelection.current = null; setMediaModalOpen(false); };
  const closeMediaModal = () => { setMediaModalOpen(false); savedSelection.current = null; };
  return <div className="border bg-white"><div className="flex flex-wrap gap-1 border-b p-2" role="toolbar" aria-label="Formatting tools">{buttons.map((button) => <button className={`border px-2 py-1 text-xs ${button.active?.() ? "bg-[var(--orange)] text-white" : ""}`} type="button" key={button.label} aria-label={button.label} aria-pressed={button.active?.() ?? false} disabled={!button.enabled()} onMouseDown={(event) => event.preventDefault()} onClick={button.run}>{button.label}</button>)}</div><div className="p-4"><EditorContent editor={editor} /><ImageControls editor={editor} metadata={selectedMedia} /></div><InsertMediaModal open={mediaModalOpen} onClose={closeMediaModal} onInsert={insertInlineImage} allowedPlacements={["inline"]} /><input type="hidden" name={name} value={value} /></div>;
});

function countImages(value: unknown): number { if (!value || typeof value !== "object") return 0; const node = value as { type?: string; content?: unknown[] }; return (node.type === "image" ? 1 : 0) + (node.content?.reduce<number>((total, child) => total + countImages(child), 0) ?? 0); }
