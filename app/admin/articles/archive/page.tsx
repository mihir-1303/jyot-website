import { ArticleArchiveTable } from "../../../../components/cms/ArticleArchiveTable";
import Link from "next/link";
import { getAdminArticles } from "../../../../lib/data/admin";
import { requirePermission } from "../../../../lib/permissions";

const names = (value: unknown) => (Array.isArray(value) ? value : value ? [value] : []).map((item) => String((item as { name?: unknown }).name ?? item)).join(" · ");
const date = (value: unknown) => value ? new Date(String(value)).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";

export default async function ArticleArchivePage() { await requirePermission("articles.read"); const items = await getAdminArticles("archived"); return <main><div className="admin-page-heading"><div><p className="eyebrow">CMS / Articles</p><h1 className="serif mt-2 text-5xl">Archive</h1><p className="mt-3 text-sm text-[var(--muted)]">Archived articles remain available for review and restoration.</p></div><Link className="bg-[var(--orange)] px-4 py-3 font-bold text-white" href="/admin/articles">Back to articles</Link></div><ArticleArchiveTable items={items.map((item) => ({ id: String(item._id), title: item.title, author: names(item.author), category: names(item.category), archivedAt: date(item.archivedAt ?? item.updatedAt), archiveReason: item.archiveReason, archiveNotes: item.archiveNotes, status: item.status }))} /></main>; }
