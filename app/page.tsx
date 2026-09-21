import { EditorialClose, Footer } from "../components/Footer";
import { Header, type EditorialTickerItem } from "../components/Header";
import { renderHomepageSections } from "../components/HomepageSectionRenderer";
import { TopicNav } from "../components/TopicNav";
import { ResearchExplorer } from "../components/ResearchExplorer";
import { getHomepageData } from "../lib/data/public";
export const dynamic = "force-dynamic";

async function loadHomepage() { try { return { data: await getHomepageData(), unavailable: false }; } catch { return { data: null, unavailable: true }; } }
export default async function Home() {
  const result = await loadHomepage();
  const tickerItems: EditorialTickerItem[] = result.data ? [
    ...result.data.articles.map((item) => ({ id: `article-${item.id}`, category: item.category.name, title: item.title, href: `/articles/${item.slug}`, publishedAt: item.publishedAt })),
    ...result.data.videos.map((item) => ({ id: `video-${item.id}`, category: item.category.name, title: item.title, href: `/videos/${item.slug}`, publishedAt: item.publishedAt })),
    ...result.data.research.map((item) => ({ id: `research-${item.id}`, category: item.category.name || item.type, title: item.title, href: `/research/${item.slug}`, publishedAt: item.publishedAt })),
  ].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 8).map((item) => ({ id: item.id, category: item.category, title: item.title, href: item.href })) : [];
  const content = result.data ? <>{renderHomepageSections(result.data)}<ResearchExplorer items={result.data.research} /></> : <main className="page-shell py-24"><h1 className="serif text-5xl">Jyot is being prepared.</h1><p className="mt-4 text-[var(--muted)]">The public content database is not configured yet.</p></main>;
  const categories = result.data ? [...result.data.articles.map((item) => item.category), ...result.data.videos.map((item) => item.category), ...result.data.research.map((item) => item.category)] : [];
  return <div id="top"><Header tickerItems={tickerItems} />{result.data && <TopicNav categories={categories} />}{content}<EditorialClose /><Footer categories={categories} /></div>;
}
