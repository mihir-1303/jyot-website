import type { PublicVideo } from "../lib/types/public";
import { EditorialThumbnail } from "./EditorialThumbnail";

export function VideoCard({ video }: { video: PublicVideo }) {
  return <article className="video-card"><a href={`/videos/${video.slug}`} className="card-link group block"><div className="video-card-media"><EditorialThumbnail src={video.thumbnail} alt={video.title} /><span className="video-play" aria-hidden="true">▶</span>{video.duration && <span className="video-duration">{video.duration}</span>}</div><div className="video-card-content"><p className="meta video-card-meta">{video.category.name} · {new Date(video.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p><h3 className="serif video-card-title transition-colors group-hover:text-[var(--orange)]">{video.title}</h3><p className="video-card-description">{video.description}</p><p className="meta video-card-footer">{video.author?.name ?? "Jyot"}<span className="arrow text-lg" aria-hidden="true">→</span></p></div></a></article>;
}
