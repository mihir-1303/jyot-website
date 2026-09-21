import { FeaturedGrid } from "./FeaturedGrid";
import { CollectionSection } from "./CollectionSection";
import { Hero } from "./Hero";
import { InsightsShelf } from "./InsightsShelf";
import { ResearchExplorer } from "./ResearchExplorer";
import { ResearchShelf } from "./ResearchShelf";
import { SectionHeader, SectionViewAll } from "./SectionHeader";
import { VideoShelf } from "./VideoShelf";
import type { PublicHomepageData as HomepageData, PublicSection as HomepageSection } from "../lib/types/public";

type RendererProps = { section: HomepageSection; data: HomepageData };
function selectItems<T extends { id: string; publishedAt: string }>(items: T[], selection: HomepageSection["content"]) { if (!selection || selection.mode === "latest") return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, selection?.limit ?? 3); return (selection.ids ?? []).map((id) => items.find((item) => item.id === String(id))).filter((item): item is T => Boolean(item)); }
function categoryItems<T extends { category: { id: string } }>(items: T[], categoryId?: string) { return categoryId ? items.filter((item) => item.category.id === categoryId) : items; }

export function HomepageSectionRenderer({ section, data }: RendererProps) {
  const content = section.content;
  if (section.type === "hero") {
    const selected = selectItems(data.articles, content);
    const fallback = [...data.articles].sort((a, b) => Number(b.featured) - Number(a.featured) || b.publishedAt.localeCompare(a.publishedAt));
    const stories = selected.length > 1 ? selected : [...selected, ...fallback.filter((item) => !selected.some((story) => story.id === item.id)).slice(0, Math.max(0, 5 - selected.length))];
    return stories.length ? <Hero stories={stories} settings={section.settings} /> : null;
  }
  if (section.type === "featured") { const stories = selectItems(data.articles, content); return stories.length ? <section className="section border-t divider"><div className="page-shell"><SectionHeader title={section.title} /><FeaturedGrid stories={stories} /></div></section> : null; }
  if (section.type === "articles") { const items = selectItems(categoryItems(data.articles, content?.categoryId), content); return <section id="insights" className="section border-t divider"><div className="page-shell"><SectionHeader title={section.title} /><InsightsShelf articles={items} /><SectionViewAll href="/articles" label="View all articles" /></div></section>; }
  if (section.type === "videos") { const items = selectItems(categoryItems(data.videos, content?.categoryId), content); return <section id="videos" className="section border-t divider"><div className="page-shell"><SectionHeader title={section.title} /><VideoShelf videos={items} /><SectionViewAll href="/videos" label="View all videos" /></div></section>; }
  if (section.type === "research") { const items = selectItems(categoryItems(data.research, content?.categoryId), content); return <section id="research" className="section border-t divider"><div className="page-shell"><SectionHeader title={section.title} /><ResearchShelf items={items} /><SectionViewAll href="/research" label="View all research" /></div></section>; }
  if (section.type === "research-explorer") return <ResearchExplorer title={section.title} items={selectItems(categoryItems(data.research, content?.categoryId), content)} />;
  if (section.type === "topic") { const items = selectItems(categoryItems(data.articles, content?.categoryId), content); return items.length ? <section className="section border-t divider"><div className="page-shell"><SectionHeader title={section.title} /><InsightsShelf articles={items} /><SectionViewAll href="/articles" label="View all articles" /></div></section> : null; }
  if (section.type === "collection") { const collection = selectItems(data.collections, content); return collection[0] ? <CollectionSection title={section.title} collection={collection[0]} /> : null; }
  return null;
}

export function renderHomepageSections(data: HomepageData) { return data.config.sections.filter((section) => section.enabled).sort((a, b) => a.order - b.order).map((section) => <HomepageSectionRenderer key={section.id} section={section} data={data} />); }
