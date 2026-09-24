import Image from "next/image";
import type { PublicMediaAsset } from "../lib/types/public";
import { parseRichText } from "../lib/rich-text";
type Node = { type?: string; text?: string; attrs?: Record<string, unknown>; content?: Node[]; marks?: { type?: string; attrs?: Record<string, unknown> }[] };
const safeHref = (href: unknown) => typeof href === "string" && /^(https?:\/\/|mailto:|tel:)/i.test(href) && !/javascript\s*:/i.test(href) ? href : undefined;
export function StructuredContent({ content, media = {} }: { content: unknown; media?: Record<string, PublicMediaAsset> }) {
  const parsedContent = parseRichText(content);
  if (typeof parsedContent === "string") return <div className="prose max-w-none whitespace-pre-wrap leading-8">{parsedContent}</div>;
  const render = (node: Node, key: string): React.ReactNode => {
    const children = node.content?.map((child, index) => render(child, `${key}-${index}`));
    if (node.type === "doc") return <div key={key}>{children}</div>;
    if (node.type === "paragraph") return <p key={key}>{children}</p>;
    if (node.type === "text") { let value: React.ReactNode = node.text ?? ""; for (const mark of node.marks ?? []) { if (mark.type === "bold") value = <strong>{value}</strong>; else if (mark.type === "italic") value = <em>{value}</em>; else if (mark.type === "underline") value = <u>{value}</u>; else if (mark.type === "link") { const href = safeHref(mark.attrs?.href); value = href ? <a href={href} rel="noopener noreferrer">{value}</a> : value; } } return <span key={key}>{value}</span>; }
    if (node.type === "heading") { const rawLevel = typeof node.attrs?.level === "number" ? node.attrs.level : 2; const level = rawLevel === 1 || rawLevel === 3 ? rawLevel : 2; if (level === 1) return <h1 key={key}>{children}</h1>; if (level === 3) return <h3 key={key}>{children}</h3>; return <h2 key={key}>{children}</h2>; }
    if (node.type === "bulletList") return <ul key={key}>{children}</ul>;
    if (node.type === "orderedList") return <ol key={key}>{children}</ol>;
    if (node.type === "listItem") return <li key={key}>{children}</li>;
    if (node.type === "blockquote") return <blockquote key={key}>{children}</blockquote>;
    if (node.type === "horizontalRule") return <hr key={key} />;
    if (node.type === "hardBreak") return <br key={key} />;
    if (node.type === "image") { const asset = typeof node.attrs?.mediaId === "string" ? media[node.attrs.mediaId] : undefined; const candidate = typeof node.attrs?.src === "string" && /^https:\/\//i.test(node.attrs.src) ? node.attrs.src : undefined; const src = asset?.url ?? candidate; return src ? <figure key={key}><Image src={src} alt={String(node.attrs?.alt ?? asset?.altText ?? "")} width={asset?.width ?? 1200} height={asset?.height ?? 675} className="h-auto w-full" /><figcaption>{asset?.caption}</figcaption></figure> : null; }
    return null;
  };
  return <div className="prose max-w-none leading-8">{render(parsedContent as Node, "content")}</div>;
}
