import Link from "next/link";
import type { PublicResearch } from "../lib/types/public";
import { ResearchExplorerCard } from "./ResearchExplorerCard";
import { ResearchExplorerTopics } from "./ResearchExplorerTopics";

export function ResearchExplorer({ items }: { items: PublicResearch[] }) {
  const topics = [...new Map(items.map((item) => [item.category.slug, item.category])).values()];
  const cards = items.slice(0, 2);
  if (!topics.length || !cards.length) return null;
  return <section className="research-explorer"><div className="page-shell"><div className="research-explorer-heading"><div><p className="eyebrow">Research desk</p><h2 className="serif text-3xl md:text-4xl">Explore research</h2></div></div><div className="research-explorer-grid"><ResearchExplorerTopics topics={topics} />{cards.map((item) => <ResearchExplorerCard item={item} key={item.id} />)}</div><Link className="research-explorer-view-all" href="/research">View all research <span className="arrow">→</span></Link></div></section>;
}
