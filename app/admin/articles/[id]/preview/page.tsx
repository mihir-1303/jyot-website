import { StructuredContent } from "../../../../../components/StructuredContent";
import { getAdminContent } from "../../../../../lib/data/admin";
import { requirePermission } from "../../../../../lib/permissions";

const list = (value: unknown) => (Array.isArray(value) ? value : value ? [value] : []).map((item) => String((item as { name?: unknown }).name ?? item)).join(" · ") || "—";
const date = (value: unknown) => value ? new Date(String(value)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default async function ArticlePreview({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("articles.read");
  const id = (await params).id;
  const item = await getAdminContent("article", id) as Record<string, unknown> | null;
  if (!item) return <p>Article not found.</p>;
  return <main className="page-shell section max-w-5xl"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Review article</p><h1 className="serif mt-4 text-5xl md:text-7xl">{String(item.title)}</h1></div><a className="border px-4 py-2 text-sm" href={`/admin/articles/${id}/edit`}>Back to editor</a></div><dl className="review-metadata"><div><dt>Status</dt><dd>{String(item.status ?? "—")}</dd></div><div><dt>Category</dt><dd>{list(item.category)}</dd></div><div><dt>Author</dt><dd>{list(item.author)}</dd></div><div><dt>Tags</dt><dd>{list(item.tags)}</dd></div><div><dt>Created</dt><dd>{date(item.createdAt)}</dd></div><div><dt>Updated</dt><dd>{date(item.updatedAt)}</dd></div><div><dt>Published</dt><dd>{date(item.publishedAt)}</dd></div><div><dt>Scheduled</dt><dd>{date(item.scheduledAt)}</dd></div></dl><p className="review-excerpt">{String(item.excerpt ?? "")}</p><div className="review-content"><StructuredContent content={item.content} /></div></main>;
}
