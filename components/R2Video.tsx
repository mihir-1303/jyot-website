"use client";

import { useState } from "react";

export function R2Video({ src, poster, title }: { src: string; poster?: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="video-player video-player-fallback" role="status">This video is currently unavailable.</div>;
  return <div className="video-player"><video controls playsInline preload="none" poster={poster} aria-label={`Video: ${title}`} onError={() => setFailed(true)}><source src={src} /></video></div>;
}
