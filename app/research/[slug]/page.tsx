import { notFound } from "next/navigation";
import { CollectionNavigation } from "../../../components/CollectionNavigation";
import { ContentDetailLayout } from "../../../components/ContentDetailLayout";
import { EditorialHeader } from "../../../components/EditorialHeader";
import { EditorialImage } from "../../../components/EditorialImage";
import { StructuredContent } from "../../../components/StructuredContent";
import { getCollectionNavigation, getPublishedResearchBySlug } from "../../../lib/data/public";
import { researchToEditorialContent } from "../../../lib/editorial";
import { canonical, editorialMetadata } from "../../../lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) { const item = await getPublishedResearchBySlug((await params).slug); return item ? editorialMetadata({ title: item.title, description: item.description, path: `/research/${item.slug}`, image: item.coverImage.url, type: "article" }) : { title: "Research | Jyot", robots: { index: false } }; }

export default async function ResearchDetailPage({ params }: Props) {
  const item = await getPublishedResearchBySlug((await params).slug);
  if (!item) notFound();
  const data = { "@context": "https://schema.org", "@type": "ScholarlyArticle", headline: item.title, description: item.description, image: item.coverImage.url, datePublished: item.publishedAt, dateModified: item.updatedAt, author: item.authors.map((author) => ({ "@type": "Person", name: author.name })), articleSection: item.category.name, mainEntityOfPage: canonical(`/research/${item.slug}`) };
  const collectionNavigation = await getCollectionNavigation("research", item.id);
  return <ContentDetailLayout breadcrumbs={[{ label: "Research", href: "/research" }, { label: item.title }]} jsonLd={data}>
    <div className="article-layout">
      <article className="article-main">
        <EditorialHeader content={researchToEditorialContent(item)} eyebrow={item.type} showByline={false} />
        <div className="article-hero"><EditorialImage src={item.coverImage} alt={item.coverImage.altText} priority /></div>
        <div className="article-body"><StructuredContent content={item.content} /></div>
        {item.pdfMedia && <p><a className="eyebrow border-b border-[var(--orange)] pb-2" href={item.pdfMedia.url}>Download research PDF →</a></p>}
      </article>
      <aside className="article-author" aria-label="Research authors">
        <p className="eyebrow">Authors</p>
        <div className="article-author-rule" aria-hidden="true" />
        {item.authors.map((author) => <div key={author.id}><h2 className="serif article-author-name">{author.name}</h2>{author.bio && <p className="article-author-bio">{author.bio}</p>}</div>)}
        <p className="meta article-read-time">{item.category.name}</p>
      </aside>
    </div>
    {collectionNavigation[0] && <CollectionNavigation {...collectionNavigation[0]} />}
  </ContentDetailLayout>;
}
