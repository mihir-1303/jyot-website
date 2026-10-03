import Link from "next/link";
import { requirePermission } from "../../../../lib/permissions";

export default async function ResearchExplorePage() {
  await requirePermission("research.read");
  return <main><p className="eyebrow">CMS / Research</p><h1 className="serif mt-2 text-5xl">Explore Research</h1><div className="mt-8 max-w-2xl border bg-white p-6"><h2 className="serif text-2xl">Automatic topic navigation</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Explore Research is generated automatically from published Research topics. Select or create a Research Topic in the Research form; published items will appear under that topic without any additional setup.</p><Link className="mt-5 inline-block bg-[var(--orange)] px-4 py-3 text-sm font-bold text-white" href="/admin/research/new">Create research</Link></div></main>;
}
