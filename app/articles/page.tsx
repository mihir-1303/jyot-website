import Link from "next/link";
import { PublicationArticleCard, PublicationArticleFeature } from "../../components/PublicationListingCards";
import { getPublishedArticles, getPublishedCategories } from "../../lib/data/public";
import type { PublicArticle, PublicCategory } from "../../lib/types/public";
import { editorialMetadata } from "../../lib/seo";
import { Breadcrumbs } from "../../components/Breadcrumbs";

export const metadata = editorialMetadata({ title: "Articles", description: "Ideas, people and perspectives from Jyot.", path: "/articles" });
export const dynamic = "force-dynamic";

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const categoryFilter = (await searchParams).category?.trim().toLowerCase() ?? "";
  let articles: PublicArticle[] = [];
  let categories: PublicCategory[] = [];
  let unavailable = false;
  try { [articles, categories] = await Promise.all([getPublishedArticles(undefined, { category: categoryFilter || undefined }), getPublishedCategories("articles")]); } catch { unavailable = true; }
  const [featured, ...rest] = articles;

  return <main className="listing-page page-shell section">
    <Breadcrumbs items={[{ label: "Articles" }]} />
    <header className="listing-page-header"><p className="eyebrow">Jyot · Editorial</p><h1 className="serif listing-page-title">Articles</h1><p className="listing-intro">Analysis, ideas and perspectives on the forces shaping a more inclusive tomorrow.</p></header>
    {!unavailable && <nav aria-label="Article categories" className="listing-topic-nav"><Link className={!categoryFilter ? "listing-topic-active" : ""} href="/articles">All</Link>{categories.map((category) => <Link className={categoryFilter === category.slug ? "listing-topic-active" : ""} href={`/articles?category=${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>)}</nav>}
    {unavailable ? <p className="listing-empty">Published content is temporarily unavailable.</p> : !featured ? <p className="listing-empty">{categoryFilter ? "No content found." : "No published articles yet."}</p> : <><section aria-labelledby="featured-article" className="listing-lead-section"><div className="listing-section-heading"><p className="eyebrow">Featured</p><h2 id="featured-article" className="serif">The latest perspective</h2></div><PublicationArticleFeature article={featured} /></section>{rest.length > 0 && <section aria-labelledby="latest-articles" className="listing-latest-section"><div className="listing-section-heading"><p className="eyebrow">Latest</p><h2 id="latest-articles" className="serif">Latest Articles</h2></div><div className="publication-grid">{rest.map((article) => <PublicationArticleCard article={article} key={article.id} />)}</div></section>}</>}
  </main>;
}
