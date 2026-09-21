"use client";
export default function VideosError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main><p className="eyebrow">CMS</p><h1 className="serif mt-2 text-5xl">Videos</h1><p role="alert" className="mt-8 text-red-700">Unable to load videos right now.</p><button className="mt-4 border px-4 py-2" onClick={reset}>Try again</button></main>; }
