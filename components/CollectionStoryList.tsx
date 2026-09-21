import Link from "next/link";
import type { PublicCollectionItem } from "../lib/types/public";
import { EditorialImage } from "./EditorialImage";

const label = (type: PublicCollectionItem["type"]) => type === "article" ? "Article" : type === "research" ? "Research" : "Video";
const href = (item: PublicCollectionItem) => `/${item.type === "article" ? "articles" : item.type === "research" ? "research" : "videos"}/${item.slug}`;
export function CollectionStoryList({ items }: { items: PublicCollectionItem[] }) { return <div className="collection-story-list">{items.map((item, index) => <article className="collection-story" key={`${item.type}-${item.slug}`}><Link className="collection-story-image" href={href(item)}><EditorialImage src={item.image} alt={item.title} /></Link><div className="collection-story-copy"><p className="eyebrow">{String(index + 1).padStart(2, "0")} · {label(item.type)}</p><h2 className="serif collection-story-title"><Link href={href(item)}>{item.title}</Link></h2><p className="collection-story-meta">{item.author} · {new Date(item.publishedAt).toLocaleDateString("en-US", { dateStyle: "long" })}</p><p className="collection-story-description">{item.description}</p></div></article>)}</div>; }
