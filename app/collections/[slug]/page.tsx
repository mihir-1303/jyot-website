import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CollectionStoryList } from "../../../components/CollectionStoryList";
import { JsonLd } from "../../../components/JsonLd";
import { EditorialImage } from "../../../components/EditorialImage";
import { getPublishedCollectionBySlug } from "../../../lib/data/public";
import { canonical, editorialMetadata } from "../../../lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) { const collection = await getPublishedCollectionBySlug((await params).slug); return collection ? editorialMetadata({ title: collection.seo?.metaTitle || collection.title, description: collection.seo?.metaDescription || collection.description, path: `/collections/${collection.slug}`, image: collection.coverImage?.url }) : { title: "Collection | Jyot", robots: { index: false } }; }

export default async function CollectionPage({ params }: Props) {
  const collection = await getPublishedCollectionBySlug((await params).slug);
  if (!collection) notFound();
  const data = { "@context": "https://schema.org", "@type": "CollectionPage", name: collection.title, description: collection.description, url: canonical(`/collections/${collection.slug}`), ...(collection.coverImage ? { image: collection.coverImage.url } : {}), hasPart: collection.items.map((item) => ({ "@type": item.type === "video" ? "VideoObject" : "Article", name: item.title })) };
  return <main className="collection-page page-shell section"><Breadcrumbs items={[{ label: "Collections", href: "/collections" }, { label: collection.title }]} /><JsonLd data={data} /><header className="collection-header"><p className="eyebrow">Collection / Series</p><h1 className="serif collection-title">{collection.title}</h1><p className="collection-description">{collection.description}</p>{collection.coverImage && <div className="collection-cover"><EditorialImage src={collection.coverImage} alt={collection.title} priority /></div>}<p className="meta collection-count">{collection.items.length} {collection.items.length === 1 ? "story" : "stories"}{collection.curator ? ` · Curated by ${collection.curator.name}` : ""}</p></header><section className="collection-stories" aria-labelledby="collection-stories-heading"><div className="listing-section-heading"><p className="eyebrow">The series</p><h2 id="collection-stories-heading" className="serif">Stories</h2></div>{collection.items.length ? <CollectionStoryList items={collection.items} /> : <p className="listing-empty">This collection has no currently published stories.</p>}</section></main>;
}
