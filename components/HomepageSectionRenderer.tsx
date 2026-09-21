import { FeaturedGrid } from "./FeaturedGrid";
import { Hero } from "./Hero";
import { InsightsShelf } from "./InsightsShelf";
import { ResearchShelf } from "./ResearchShelf";
import { SectionHeader } from "./SectionHeader";
import { VideoShelf } from "./VideoShelf";
import type { PublicHomepageData as HomepageData, PublicSection as HomepageSection } from "../lib/types/public";

type RendererProps = { section: HomepageSection; data: HomepageData };

function selectItems<T extends { id: string; publishedAt: string }>(items: T[], selection: HomepageSection["content"]) {
  if (!selection || selection.mode === "latest") return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, selection?.limit ?? 3);
  const selected = selection.ids ?? [];
  return selected.map((id) => items.find((item) => item.id === String(id))).filter((item): item is T => Boolean(item));
}

export function HomepageSectionRenderer({ section, data }: RendererProps) {
  const content = section.content;
  if (section.type === "hero") { const story = selectItems(data.articles, content)[0]; return story ? <Hero story={story} settings={section.settings} /> : null; }
  if (section.type === "featured") { const stories = selectItems(data.articles, content); return stories.length ? <section className="section border-t divider"><div className="page-shell"><SectionHeader title={section.title} /><FeaturedGrid stories={stories} /></div></section> : null; }
  if (section.type === "articles") { const items = selectItems(data.articles, content); return <section id="insights" className="section border-t divider"><div className="page-shell"><SectionHeader title={section.title} href="/articles" /><InsightsShelf articles={items} /></div></section>; }
  if (section.type === "videos") { const items = selectItems(data.videos, content); return <section id="videos" className="section border-t divider"><div className="page-shell"><SectionHeader title={section.title} href="/videos" /><VideoShelf videos={items} /></div></section>; }
  const items = selectItems(data.research, content);
  return <section id="research" className="section border-t divider"><div className="page-shell"><SectionHeader title={section.title} href="/research" /><ResearchShelf items={items} /></div></section>;
}

export function renderHomepageSections(data: HomepageData) { return data.config.sections.filter((section) => section.enabled).sort((a, b) => a.order - b.order).map((section) => <HomepageSectionRenderer key={section.id} section={section} data={data} />); }
