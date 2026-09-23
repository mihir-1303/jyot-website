import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CollectionNavigation } from "../../../components/CollectionNavigation";
import { EditorialImage } from "../../../components/EditorialImage";
import { JsonLd } from "../../../components/JsonLd";
import { StructuredContent } from "../../../components/StructuredContent";
import { getCollectionNavigation, getPublishedResearchBySlug } from "../../../lib/data/public";
import { canonical, editorialMetadata } from "../../../lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) { const item = await getPublishedResearchBySlug((await params).slug); return item ? editorialMetadata({ title: item.title, description: item.description, path: `/research/${item.slug}`, image: item.coverImage.url, type: "article" }) : { title: "Research | Jyot", robots: { index: false } }; }

export default async function ResearchDetailPage({ params }: Props) {
  const item = await getPublishedResearchBySlug((await params).slug);
  if (!item) notFound();
  const data = { "@context": "https://schema.org", "@type": "ScholarlyArticle", headline: item.title, description: item.description, image: item.coverImage.url, datePublished: item.publishedAt, dateModified: item.updatedAt, author: item.authors.map((author) => ({ "@type": "Person", name: author.name })), articleSection: item.category.name, mainEntityOfPage: canonical(`/research/${item.slug}`) };
  const collectionNavigation = await getCollectionNavigation("research", item.id);
  return <main className="page-shell section max-w-5xl"><Breadcrumbs items={[{ label: "Research", href: "/research" }, { label: item.title }]} /><JsonLd data={data} /><p className="eyebrow">{item.type}</p><h1 className="serif mt-4 text-5xl md:text-7xl">{item.title}</h1><p className="mt-6 text-lg leading-8 text-[var(--muted)]">{item.description}</p><p className="meta mt-6">{item.authors.map((author) => author.name).join(" · ")} · {new Date(item.publishedAt).toLocaleDateString("en-US", { dateStyle: "long" })}</p><div className="mt-12"><EditorialImage src={item.coverImage} alt={item.coverImage.altText} /><div className="mt-12"><StructuredContent content={item.content} /></div></div>{item.pdfMedia && <p className="mt-8"><a className="eyebrow border-b border-[var(--orange)] pb-2" href={item.pdfMedia.url}>Download research PDF →</a></p>}{collectionNavigation[0] && <CollectionNavigation {...collectionNavigation[0]} />}</main>;
}
