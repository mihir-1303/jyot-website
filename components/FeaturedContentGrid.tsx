import Link from "next/link";
import type { PublicFeaturedItem } from "../lib/types/public";
import { Image16x9 } from "./Image16x9";

export function FeaturedContentGrid({ items }: { items: PublicFeaturedItem[] }) {
  return <div className="featured-layout">{items.map((item) => <article className="featured-story" key={`${item.type}-${item.id}`}><Link href={item.href} className="card-link group block"><Image16x9 src={item.image} alt={item.title} sizes="(max-width: 767px) 91vw, (max-width: 1023px) 44vw, 29vw" /><div className="featured-story-body"><p className="meta">{item.category.name} · {item.type} · {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p><h3 className="featured-story-title serif transition-colors group-hover:text-[var(--orange)]">{item.title}</h3><p className="featured-story-excerpt text-[var(--muted)]">{item.description}</p><p className="meta">{item.author}</p><span className="arrow featured-story-arrow" aria-hidden="true">→</span></div></Link></article>)}</div>;
}
