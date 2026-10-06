import Link from "next/link";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { getPublishedCategories } from "../../lib/data/public";
import { editorialMetadata } from "../../lib/seo";

export const metadata = editorialMetadata({ title: "Categories", description: "Explore Jyot content by category.", path: "/categories" });
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getPublishedCategories>> = [];
  try { categories = await getPublishedCategories(); } catch { /* The empty state keeps the public route available when the database is unavailable. */ }
  return <main className="listing-page page-shell section"><Breadcrumbs items={[{ label: "Categories" }]} /><header className="listing-page-header"><p className="eyebrow">Jyot · Editorial</p><h1 className="serif listing-page-title">Categories</h1><p className="listing-intro">Explore articles, videos and research by category.</p></header>{categories.length === 0 ? <p className="listing-empty">No categories available yet.</p> : <div className="publication-grid">{categories.map((category) => <Link className="publication-card border p-6" href={`/categories/${category.slug}`} key={category.id}><p className="eyebrow">Category</p><h2 className="serif mt-2 text-3xl">{category.name}</h2>{category.description && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{category.description}</p>}<span className="meta mt-6 block">Explore category →</span></Link>)}</div>}</main>;
}
