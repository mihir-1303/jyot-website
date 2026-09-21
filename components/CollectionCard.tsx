import Link from "next/link";
import type { PublicCollectionSummary } from "../lib/types/public";
import { EditorialImage } from "./EditorialImage";

export function CollectionCard({ collection }: { collection: PublicCollectionSummary }) { return <article><Link className="card-link group block" href={`/collections/${collection.slug}`}>{collection.coverImage ? <EditorialImage src={collection.coverImage} alt={collection.title} /> : <div className="editorial-thumbnail" aria-hidden="true" />}</Link><div className="pt-3"><p className="eyebrow">Collection · {collection.itemCount} stories</p><h2 className="serif mt-1.5 text-2xl leading-tight group-hover:text-[var(--orange)]"><Link href={`/collections/${collection.slug}`}>{collection.title}</Link></h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{collection.description}</p><p className="meta mt-3">Published {new Date(collection.publishedAt).toLocaleDateString("en-US", { dateStyle: "long" })}</p></div></article>; }
