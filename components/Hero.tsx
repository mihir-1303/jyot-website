"use client";

import { useEffect, useRef, useState } from "react";
import { Image16x9 } from "./Image16x9";
import type { PublicArticle as Article } from "../lib/types/public";

type HeroSettings = { label?: string; heading?: string; description?: string; ctaLabel?: string; ctaHref?: string };

export function Hero({ stories, settings }: { stories: Article[]; settings?: HeroSettings }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const interactionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pausedRef = useRef(false);
  const story = stories[activeIndex] ?? stories[0];
  const hasMultipleStories = stories.length > 1;
  const heading = hasMultipleStories ? story.title : settings?.heading ?? story.title;
  const description = hasMultipleStories ? story.excerpt : settings?.description ?? story.excerpt;
  const label = hasMultipleStories ? story.category.name : settings?.label ?? story.category.name;
  const href = hasMultipleStories ? `/articles/${story.slug}` : settings?.ctaHref ?? `/articles/${story.slug}`;
  const date = new Date(story.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  useEffect(() => () => { if (interactionTimer.current) clearTimeout(interactionTimer.current); }, []);
  useEffect(() => { pausedRef.current = hovering || interacting; }, [hovering, interacting]);
  useEffect(() => {
    if (stories.length < 2) return;
    const timer = setInterval(() => {
      if (!pausedRef.current) setActiveIndex((current) => (current + 1) % stories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [stories.length]);
  const chooseSlide = (index: number) => {
    setActiveIndex(index);
    setInteracting(true);
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    interactionTimer.current = setTimeout(() => setInteracting(false), 700);
  };

  return <section className="homepage-hero" aria-label="Featured stories" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false); }}>
    <div className="homepage-hero-inner">
      <div className="hero-stage">
        <div className="hero-slide" key={story.id}>
          <a href={`/articles/${story.slug}`} className="hero-image-link card-link" aria-label={`Read ${story.title}`}><Image16x9 src={story.featuredImage} alt={story.title} priority={activeIndex === 0} /></a>
          <article className="hero-story-card">
            <p className="eyebrow hero-story-label">{label}</p>
            <p className="meta hero-story-date">{date}</p>
            <h1 className="serif hero-story-title">{heading}</h1>
            {description && <p className="hero-story-excerpt">{description}</p>}
            <a href={href} className="hero-story-action">{settings?.ctaLabel ?? "Read the story"}<span className="arrow" aria-hidden="true">→</span></a>
          </article>
        </div>
        {stories.length > 1 && <div className="hero-pagination" aria-label="Featured story slides">{stories.map((item, index) => <button key={item.id} type="button" className={`hero-dot ${index === activeIndex ? "hero-dot-active" : ""}`} aria-label={`Show ${item.title}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => chooseSlide(index)} />)}</div>}
      </div>
    </div>
  </section>;
}
