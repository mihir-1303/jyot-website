import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { VideoPlayer } from "../../../components/VideoPlayer";
import { CollectionNavigation } from "../../../components/CollectionNavigation";
import { JsonLd } from "../../../components/JsonLd";
import { getCollectionNavigation, getPublishedVideoBySlug } from "../../../lib/data/public";
import { canonical, editorialMetadata } from "../../../lib/seo";
import { EditorialHeader } from "../../../components/EditorialHeader";
import { videoToEditorialContent } from "../../../lib/editorial";
import { StructuredContent } from "../../../components/StructuredContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) { const item = await getPublishedVideoBySlug((await params).slug); return item ? editorialMetadata({ title: item.title, description: item.description, path: `/videos/${item.slug}`, image: item.thumbnail.url, type: "video" }) : { title: "Video | Jyot", robots: { index: false } }; }

export default async function VideoPage({ params }: Props) {
  const item = await getPublishedVideoBySlug((await params).slug);
  if (!item) notFound();
  const data = { "@context": "https://schema.org", "@type": "VideoObject", name: item.title, description: item.description, thumbnailUrl: item.thumbnail.url, uploadDate: item.publishedAt, url: canonical(`/videos/${item.slug}`), ...(item.videoUrl ? { contentUrl: item.videoUrl } : {}) };
  const collectionNavigation = await getCollectionNavigation("video", item.id);
  return <main className="page-shell section max-w-4xl"><Breadcrumbs items={[{ label: "Videos", href: "/videos" }, { label: item.title }]} /><JsonLd data={data} /><EditorialHeader content={videoToEditorialContent(item)} showExcerpt={false} /><div className="mt-12"><VideoPlayer video={item} /></div>{item.description && <div className="mt-8"><StructuredContent content={item.descriptionContent ?? item.description} /></div>}{collectionNavigation[0] && <CollectionNavigation {...collectionNavigation[0]} />}</main>;
}
