import { Image16x9 } from "./Image16x9";
import type { PublicArticle as Article } from "../lib/types/public";

type HeroSettings = { label?: string; heading?: string; description?: string; ctaLabel?: string; ctaHref?: string };

export function Hero({ story, settings }: { story: Article; settings?: HeroSettings }) {
  const heading = settings?.heading ?? story.title;
  const description = settings?.description ?? story.excerpt;
  const href = settings?.ctaHref ?? `/articles/${story.slug}`;
  const date = new Date(story.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return <section className="homepage-hero" aria-label="Featured story">
    <div className="homepage-hero-inner">
      <div className="hero-stage">
        <a href={`/articles/${story.slug}`} className="hero-image-link card-link" aria-label={`Read ${story.title}`}><Image16x9 src={story.featuredImage} alt={story.title} priority /></a>
        <article className="hero-story-card">
          <p className="eyebrow hero-story-label">{settings?.label ?? story.category.name}</p>
          <p className="meta hero-story-date">{date}</p>
          <h1 className="serif hero-story-title">{heading}</h1>
          {description && <p className="hero-story-excerpt">{description}</p>}
          <a href={href} className="hero-story-action">{settings?.ctaLabel ?? "Read the story"}<span className="arrow" aria-hidden="true">→</span></a>
        </article>
      </div>
    </div>
  </section>;
}
