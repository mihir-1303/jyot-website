import Link from "next/link";
import type { PublicVideo } from "../lib/types/public";
import { EditorialThumbnail } from "./EditorialThumbnail";
import { EditorialCardMeta } from "./EditorialCardMeta";

export function VideoCard({ video }: { video: PublicVideo }) {
  return <article className="video-card"><Link href={`/videos/${video.slug}`} className="card-link group block"><div className="video-card-media"><EditorialThumbnail src={video.thumbnail} alt={video.title} sizes="(max-width: 767px) 91vw, (max-width: 1023px) 44vw, 29vw" /><span className="video-play" aria-hidden="true">▶</span>{video.duration && <span className="video-duration">{video.duration}</span>}</div><div className="video-card-content"><EditorialCardMeta category={video.category.name} publishedAt={video.publishedAt} /><h3 className="serif video-card-title transition-colors group-hover:text-[var(--orange)]">{video.title}</h3><p className="video-card-description">{video.description}</p><p className="meta video-card-footer">{video.author?.name ?? "Jyot"}<span className="arrow text-lg" aria-hidden="true">→</span></p></div></Link></article>;
}
