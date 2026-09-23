import Link from "next/link";
import type { PublicArticle } from "../lib/types/public";
import { Image16x9 } from "./Image16x9";

export function FeaturedStory({ story }: { story: PublicArticle }) {
  return <article className="featured-story"><Link href={`/articles/${story.slug}`} className="card-link group block"><Image16x9 src={story.featuredImage} alt={story.title} sizes="(max-width: 767px) 91vw, (max-width: 1023px) 44vw, 29vw" /><div className="featured-story-body"><p className="meta">{story.category.name} · {new Date(story.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p><h3 className="featured-story-title serif transition-colors group-hover:text-[var(--orange)]">{story.title}</h3><p className="featured-story-excerpt text-[var(--muted)]">{story.excerpt}</p><span className="arrow featured-story-arrow" aria-hidden="true">→</span></div></Link></article>;
}
