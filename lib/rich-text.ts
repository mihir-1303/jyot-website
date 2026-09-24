type RichTextNode = { type?: string; text?: string; content?: RichTextNode[] };

export function parseRichText(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" ? parsed : value;
  } catch {
    return value;
  }
}

export function richTextPlainText(value: unknown): string {
  const parsed = parseRichText(value);
  if (typeof parsed === "string") return parsed;
  const visit = (node: RichTextNode): string => {
    if (node.type === "text") return node.text ?? "";
    const text = (node.content ?? []).map(visit).join("");
    return ["paragraph", "heading", "listItem", "blockquote"].includes(node.type ?? "") ? `${text}\n` : text;
  };
  return typeof parsed === "object" && parsed ? visit(parsed as RichTextNode).trim() : "";
}
