import type { PublicVideo } from "../lib/types/public";
import { VideoCard } from "./VideoCard";

export function VideoShelf({ videos }: { videos: PublicVideo[] }) {
  if (!videos.length) return null;
  return <div className="video-shelf">{videos.map((video) => <VideoCard key={video.id} video={video} />)}</div>;
}
