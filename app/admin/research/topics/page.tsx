import Link from "next/link";
import { DeleteButton } from "../../../../components/cms/DeleteButton";
import { deleteResearchTopic } from "../../../../lib/cms/research-topic-actions";
import { getAdminResearchTopics } from "../../../../lib/data/admin";
import { requirePermission } from "../../../../lib/permissions";

export default async function ResearchTopicsPage() {
  await requirePermission("categories.read");
  const topics = await getAdminResearchTopics();
  return <main><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">CMS / Research</p><h1 className="serif mt-2 text-5xl">Research topics</h1><p className="mt-3 text-sm text-[var(--muted)]">Only active topics used by published research appear in public navigation.</p></div><Link className="border px-4 py-3" href="/admin/research/topics/new">New topic</Link></div><div className="mt-8 overflow-x-auto border bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b text-xs uppercase tracking-[.08em] text-[var(--muted)]"><tr><th className="p-4">Topic</th><th className="p-4">Order</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{topics.map((topic) => <tr className="border-b last:border-0" key={String(topic._id)}><td className="p-4"><strong>{topic.name}</strong><p className="meta">/{topic.slug}</p></td><td className="p-4">{topic.displayOrder ?? 0}</td><td className="p-4">{topic.active === false ? "Inactive" : "Active"}</td><td className="p-4"><div className="flex gap-3"><Link className="text-[var(--orange)]" href={`/admin/research/topics/${String(topic._id)}/edit`}>Edit</Link><DeleteButton action={async () => { "use server"; const data = new FormData(); data.set("id", String(topic._id)); await deleteResearchTopic(data); }} /></div></td></tr>)}</tbody></table></div><p className="mt-3 text-xs text-[var(--muted)]">Referenced topics are safely deactivated instead of deleted.</p></main>;
}
