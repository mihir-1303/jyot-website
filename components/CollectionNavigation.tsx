import Link from "next/link";
import type { PublicCollectionItem } from "../lib/types/public";

const href = (item: PublicCollectionItem) => `/${item.type === "article" ? "articles" : item.type === "research" ? "research" : "videos"}/${item.slug}`;
export function CollectionNavigation({ collection, index, total, previous, next }: { collection: { title: string; slug: string }; index: number; total: number; previous?: PublicCollectionItem; next?: PublicCollectionItem }) { return <aside className="collection-navigation"><p className="eyebrow">Part of</p><Link className="serif collection-navigation-title" href={`/collections/${collection.slug}`}>{collection.title}</Link><p className="meta">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</p><div className="collection-navigation-links">{previous ? <Link href={href(previous)}>← Previous</Link> : <span>← Previous</span>}{next ? <Link href={href(next)}>Next →</Link> : <span>Next →</span>}</div></aside>; }
