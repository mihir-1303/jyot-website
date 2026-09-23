import Link from "next/link";
import { PublicationResearchCard, PublicationResearchFeature } from "../../components/PublicationListingCards";
import { getPublishedCategories, getPublishedResearch } from "../../lib/data/public";
import type { PublicCategory, PublicResearch } from "../../lib/types/public";
import { editorialMetadata } from "../../lib/seo";
import { Breadcrumbs } from "../../components/Breadcrumbs";

export const metadata = editorialMetadata({ title: "Research", description: "Research and analysis from Jyot.", path: "/research" });
export const dynamic = "force-dynamic";

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const categoryFilter = (await searchParams).category?.trim().toLowerCase() ?? "";
  let research: PublicResearch[] = [];
  let categories: PublicCategory[] = [];
  let unavailable = false;
  try { [research, categories] = await Promise.all([getPublishedResearch(undefined, { category: categoryFilter || undefined }), getPublishedCategories("research")]); } catch { unavailable = true; }
  const [featured, ...rest] = research;

  return <main className="listing-page page-shell section">
    <Breadcrumbs items={[{ label: "Research" }]} />
    <header className="listing-page-header"><p className="eyebrow">Jyot · Research</p><h1 className="serif listing-page-title">Research</h1><p className="listing-intro">Research and analysis for a more inclusive tomorrow.</p></header>
    {!unavailable && <nav aria-label="Research topics" className="listing-topic-nav"><Link className={!categoryFilter ? "listing-topic-active" : ""} href="/research">All</Link>{categories.map((category) => <Link className={categoryFilter === category.slug ? "listing-topic-active" : ""} href={`/research?category=${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>)}</nav>}
    {unavailable ? <p className="listing-empty">Published content is temporarily unavailable.</p> : !featured ? <p className="listing-empty">{categoryFilter ? "No content found." : "No published research yet."}</p> : <><section aria-labelledby="featured-research" className="listing-lead-section"><div className="listing-section-heading"><p className="eyebrow">Featured</p><h2 id="featured-research" className="serif">Research in focus</h2></div><PublicationResearchFeature item={featured} /></section>{rest.length > 0 && <section aria-labelledby="latest-research" className="listing-latest-section"><div className="listing-section-heading"><p className="eyebrow">Latest</p><h2 id="latest-research" className="serif">Latest Research</h2></div><div className="publication-grid">{rest.map((item) => <PublicationResearchCard item={item} key={item.id} />)}</div></section>}</>}
  </main>;
}
