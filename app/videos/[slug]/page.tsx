import { notFound } from "next/navigation";
import { VideoPlayer } from "../../../components/VideoPlayer";
import { CollectionNavigation } from "../../../components/CollectionNavigation";
import { getCollectionNavigation, getPublishedVideoBySlug } from "../../../lib/data/public";
import { canonical, editorialMetadata } from "../../../lib/seo";
import { EditorialHeader } from "../../../components/EditorialHeader";
import { videoToEditorialContent } from "../../../lib/editorial";
import { StructuredContent } from "../../../components/StructuredContent";
import { ContentDetailLayout } from "../../../components/ContentDetailLayout";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) { const item = await getPublishedVideoBySlug((await params).slug); return item ? editorialMetadata({ title: item.title, description: item.description, path: `/videos/${item.slug}`, image: item.thumbnail.url, type: "video" }) : { title: "Video | Jyot", robots: { index: false } }; }

export default async function VideoPage({ params }: Props) {
  const item = await getPublishedVideoBySlug((await params).slug);
  if (!item) notFound();
  const data = { "@context": "https://schema.org", "@type": "VideoObject", name: item.title, description: item.description, thumbnailUrl: item.thumbnail.url, uploadDate: item.publishedAt, url: canonical(`/videos/${item.slug}`), ...(item.videoUrl ? { contentUrl: item.videoUrl } : {}) };
  const collectionNavigation = await getCollectionNavigation("video", item.id);
  return <ContentDetailLayout breadcrumbs={[{ label: "Videos", href: "/videos" }, { label: item.title }]} jsonLd={data}>
    <div className="article-layout">
      <article className="article-main">
        <EditorialHeader content={videoToEditorialContent(item)} showByline={false} />
        <div className="article-hero"><VideoPlayer video={item} /></div>
        {item.description && <div className="article-body"><StructuredContent content={item.descriptionContent ?? item.description} /></div>}
      </article>
      <aside className="article-author" aria-label="Author information">
        <p className="eyebrow">Author</p>
        <div className="article-author-rule" aria-hidden="true" />
        <h2 className="serif article-author-name">{item.author?.name ?? "Jyot"}</h2>
        {item.author?.bio && <p className="article-author-bio">{item.author.bio}</p>}
      </aside>
    </div>
    {collectionNavigation[0] && <CollectionNavigation {...collectionNavigation[0]} />}
  </ContentDetailLayout>;
}
