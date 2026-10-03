import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { FeaturedContentGrid } from "../../components/FeaturedContentGrid";
import { getPublishedFeaturedContent } from "../../lib/data/public";

export const dynamic = "force-dynamic";

export default async function FeaturedPage() {
  const items = await getPublishedFeaturedContent();
  return <><Header /><main className="page-shell section"><div className="listing-section-heading"><p className="eyebrow">Jyot</p><h1 className="serif text-5xl md:text-7xl">Featured</h1></div>{items.length ? <FeaturedContentGrid items={items} /> : <p className="listing-empty">No featured content yet.</p>}</main><Footer categories={items.map((item) => item.category)} /></>;
}
