"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import { MediaPicker } from "./MediaPicker";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
export function RichTextEditor({ name, initialValue, onDirty }: { name: string; initialValue?: unknown; onDirty?: () => void }) {
  const [value, setValue] = useState(JSON.stringify(initialValue && typeof initialValue === "object" ? initialValue : emptyDoc));
  const editor = useEditor({ extensions: [StarterKit, Underline, Link.configure({ openOnClick: false, protocols: ["http", "https", "mailto", "tel"] }), Image.configure({ inline: false, allowBase64: false })], content: initialValue && typeof initialValue === "object" ? initialValue : emptyDoc, immediatelyRender: false, onUpdate: ({ editor: current }) => { setValue(JSON.stringify(current.getJSON())); onDirty?.(); } });
  useEffect(() => { const handler = (event: BeforeUnloadEvent) => { if (value !== JSON.stringify(initialValue && typeof initialValue === "object" ? initialValue : emptyDoc)) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [initialValue, value]);
  if (!editor) return <div className="border p-4">Loading editor…</div>;
  return <div className="border bg-white"><div className="flex flex-wrap gap-1 border-b p-2">{[["Bold", () => editor.chain().focus().toggleBold().run()], ["Italic", () => editor.chain().focus().toggleItalic().run()], ["Underline", () => editor.chain().focus().toggleUnderline().run()], ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run()], ["H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run()], ["• List", () => editor.chain().focus().toggleBulletList().run()], ["1. List", () => editor.chain().focus().toggleOrderedList().run()], ["Quote", () => editor.chain().focus().toggleBlockquote().run()], ["Rule", () => editor.chain().focus().setHorizontalRule().run()], ["Undo", () => editor.chain().focus().undo().run()], ["Redo", () => editor.chain().focus().redo().run()]].map(([label, action]) => <button className="border px-2 py-1 text-xs" type="button" key={String(label)} onClick={action as () => void}>{label as string}</button>)}</div><div className="p-4"><EditorContent editor={editor} /></div><div className="border-t p-3"><p className="mb-2 text-xs font-bold uppercase">Insert media</p><MediaPicker name="" onAssetSelect={(asset) => editor.chain().focus().setImage({ src: asset.url, alt: asset.altText, mediaId: asset._id } as never).run()} /></div><input type="hidden" name={name} value={value} /></div>;
}
