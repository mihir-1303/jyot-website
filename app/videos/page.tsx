import Link from "next/link";
import { PublicationVideoCard, PublicationVideoFeature } from "../../components/PublicationListingCards";
import { getPublishedCategories, getPublishedVideos } from "../../lib/data/public";
import type { PublicCategory, PublicVideo } from "../../lib/types/public";
import { editorialMetadata } from "../../lib/seo";
import { Breadcrumbs } from "../../components/Breadcrumbs";

export const metadata = editorialMetadata({ title: "Videos", description: "Conversations and perspectives from Jyot.", path: "/videos" });
export const dynamic = "force-dynamic";

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const categoryFilter = (await searchParams).category?.trim().toLowerCase() ?? "";
  let videos: PublicVideo[] = [];
  let categories: PublicCategory[] = [];
  let unavailable = false;
  try { [videos, categories] = await Promise.all([getPublishedVideos(undefined, { category: categoryFilter || undefined }), getPublishedCategories("videos")]); } catch { unavailable = true; }
  const [featured, ...rest] = videos;

  return <main className="listing-page page-shell section">
    <Breadcrumbs items={[{ label: "Videos" }]} />
    <header className="listing-page-header"><p className="eyebrow">Jyot · Watch</p><h1 className="serif listing-page-title">Videos</h1><p className="listing-intro">Conversations and perspectives on the ideas shaping our shared future.</p></header>
    {!unavailable && <nav aria-label="Video categories" className="listing-topic-nav"><Link aria-current={!categoryFilter ? "page" : undefined} className={!categoryFilter ? "listing-topic-active" : ""} href="/videos">All</Link>{categories.map((category) => <Link aria-current={categoryFilter === category.slug ? "page" : undefined} className={categoryFilter === category.slug ? "listing-topic-active" : ""} href={`/videos?category=${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>)}</nav>}
    {unavailable ? <p className="listing-empty">Published content is temporarily unavailable.</p> : !featured ? <p className="listing-empty">{categoryFilter ? "No content found." : "No published videos yet."}</p> : <><section aria-labelledby="featured-video" className="listing-lead-section"><div className="listing-section-heading"><p className="eyebrow">Featured</p><h2 id="featured-video" className="serif">Watch the latest</h2></div><PublicationVideoFeature video={featured} /></section>{rest.length > 0 && <section aria-labelledby="latest-videos" className="listing-latest-section"><div className="listing-section-heading"><p className="eyebrow">Latest</p><h2 id="latest-videos" className="serif">Latest Videos</h2></div><div className="publication-grid">{rest.map((video) => <PublicationVideoCard video={video} key={video.id} />)}</div></section>}</>}
  </main>;
}
