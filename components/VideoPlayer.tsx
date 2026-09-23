import type { PublicVideo } from "../lib/types/public";
import { R2Video } from "./R2Video";

function youtubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
    }
    if (hostname !== "youtube.com" && hostname !== "youtube-nocookie.com") return null;
    const id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]{6,20})/)?.[1];
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
  } catch {
    return null;
  }
}

export function VideoPlayer({ video }: { video: PublicVideo }) {
  const embedUrl = video.provider === "youtube" && video.videoUrl ? youtubeEmbedUrl(video.videoUrl) : null;
  if (embedUrl) return <div className="video-player"><iframe src={embedUrl} title={`Video: ${video.title}`} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>;
  if (video.sourceType === "r2" && video.videoUrl) return <R2Video src={video.videoUrl} poster={video.thumbnail.url} title={video.title} />;
  return <div className="video-player video-player-fallback" role="status">This video is currently unavailable.</div>;
}
