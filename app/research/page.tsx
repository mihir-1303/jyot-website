import Link from "next/link";
import { PublicationResearchCard, PublicationResearchFeature } from "../../components/PublicationListingCards";
import { getPublishedResearch } from "../../lib/data/public";
import type { PublicResearch } from "../../lib/types/public";
import { editorialMetadata } from "../../lib/seo";

export const metadata = editorialMetadata({ title: "Research", description: "Research and analysis from Jyot.", path: "/research" });
export const dynamic = "force-dynamic";

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const categoryFilter = (await searchParams).category ?? "";
  let research: PublicResearch[] = [];
  let unavailable = false;
  try { research = await getPublishedResearch(); } catch { unavailable = true; }
  const categories = [...new Map(research.map((item) => [item.category.slug, item.category])).values()];
  const filtered = categoryFilter ? research.filter((item) => item.category.slug === categoryFilter) : research;
  const [featured, ...rest] = filtered;

  return <main className="listing-page page-shell section">
    <header className="listing-page-header"><p className="eyebrow">Jyot · Research</p><h1 className="serif listing-page-title">Research</h1><p className="listing-intro">Research and analysis for a more inclusive tomorrow.</p></header>
    {!unavailable && <nav aria-label="Research topics" className="listing-topic-nav"><Link className={!categoryFilter ? "listing-topic-active" : ""} href="/research">All</Link>{categories.map((category) => <Link className={categoryFilter === category.slug ? "listing-topic-active" : ""} href={`/research?category=${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>)}</nav>}
    {unavailable ? <p className="listing-empty">Published content is temporarily unavailable.</p> : !featured ? <p className="listing-empty">No published research yet.</p> : <><section aria-labelledby="featured-research" className="listing-lead-section"><div className="listing-section-heading"><p className="eyebrow">Featured</p><h2 id="featured-research" className="serif">Research in focus</h2></div><PublicationResearchFeature item={featured} /></section>{rest.length > 0 && <section aria-labelledby="latest-research" className="listing-latest-section"><div className="listing-section-heading"><p className="eyebrow">Latest</p><h2 id="latest-research" className="serif">Latest Research</h2></div><div className="publication-grid">{rest.map((item) => <PublicationResearchCard item={item} key={item.id} />)}</div></section>}</>}
  </main>;
}
