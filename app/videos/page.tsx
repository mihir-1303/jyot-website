import { PublicationVideoCard, PublicationVideoFeature } from "../../components/PublicationListingCards";
import { getPublishedVideos } from "../../lib/data/public";
import type { PublicVideo } from "../../lib/types/public";
import { editorialMetadata } from "../../lib/seo";

export const metadata = editorialMetadata({ title: "Videos", description: "Conversations and perspectives from Jyot.", path: "/videos" });
export const dynamic = "force-dynamic";

export default async function VideosPage() {
  let videos: PublicVideo[] = [];
  let unavailable = false;
  try { videos = await getPublishedVideos(); } catch { unavailable = true; }
  const [featured, ...rest] = videos;

  return <main className="listing-page page-shell section">
    <header className="listing-page-header"><p className="eyebrow">Jyot · Watch</p><h1 className="serif listing-page-title">Videos</h1><p className="listing-intro">Conversations and perspectives on the ideas shaping our shared future.</p></header>
    {unavailable ? <p className="listing-empty">Published content is temporarily unavailable.</p> : !featured ? <p className="listing-empty">No published videos yet.</p> : <><section aria-labelledby="featured-video" className="listing-lead-section"><div className="listing-section-heading"><p className="eyebrow">Featured</p><h2 id="featured-video" className="serif">Watch the latest</h2></div><PublicationVideoFeature video={featured} /></section>{rest.length > 0 && <section aria-labelledby="latest-videos" className="listing-latest-section"><div className="listing-section-heading"><p className="eyebrow">Latest</p><h2 id="latest-videos" className="serif">Latest Videos</h2></div><div className="publication-grid">{rest.map((video) => <PublicationVideoCard video={video} key={video.id} />)}</div></section>}</>}
  </main>;
}
