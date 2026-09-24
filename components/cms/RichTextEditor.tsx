"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import { MediaPicker } from "./MediaPicker";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
function normalizeContent(value: unknown) { if (value && typeof value === "object") return value; if (typeof value === "string" && value.trim()) { try { return JSON.parse(value); } catch { return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] }; } } return emptyDoc; }
type ToolbarButton = { label: string; active?: () => boolean; enabled: () => boolean; run: () => void };

export function RichTextEditor({ name, initialValue, onDirty }: { name: string; initialValue?: unknown; onDirty?: () => void }) {
  const initialContent = normalizeContent(initialValue); const [value, setValue] = useState(JSON.stringify(initialContent)); const [, refreshToolbar] = useState(0);
  const editor = useEditor({ extensions: [StarterKit, Underline, Link.configure({ openOnClick: false, protocols: ["http", "https", "mailto", "tel"] }), Image.configure({ inline: false, allowBase64: false })], content: initialContent, immediatelyRender: false, onTransaction: () => refreshToolbar((current) => current + 1), onUpdate: ({ editor: current }) => { setValue(JSON.stringify(current.getJSON())); onDirty?.(); } });
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
  return <div className="border bg-white"><div className="flex flex-wrap gap-1 border-b p-2" role="toolbar" aria-label="Formatting tools">{buttons.map((button) => <button className={`border px-2 py-1 text-xs ${button.active?.() ? "bg-[var(--orange)] text-white" : ""}`} type="button" key={button.label} aria-label={button.label} aria-pressed={button.active?.() ?? false} disabled={!button.enabled()} onMouseDown={(event) => event.preventDefault()} onClick={button.run}>{button.label}</button>)}</div><div className="p-4"><EditorContent editor={editor} /></div><div className="border-t p-3"><p className="mb-2 text-xs font-bold uppercase">Insert media</p><MediaPicker name="" onAssetSelect={(asset) => editor.chain().focus().setImage({ src: asset.url, alt: asset.altText, mediaId: asset._id } as never).run()} /></div><input type="hidden" name={name} value={value} /></div>;
}
