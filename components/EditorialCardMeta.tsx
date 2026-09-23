export function EditorialCardMeta({ category, publishedAt }: { category: string; publishedAt: string }) {
  return <p className="meta">{category} · {new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>;
}
