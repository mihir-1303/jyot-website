import type { PublicResearch } from "../lib/types/public";
import { ResearchCard } from "./ResearchCard";

export function ResearchShelf({ items }: { items: PublicResearch[] }) {
  if (!items.length) return null;
  return <div className="research-shelf">{items.map((item) => <ResearchCard item={item} compact key={item.id} />)}</div>;
}
