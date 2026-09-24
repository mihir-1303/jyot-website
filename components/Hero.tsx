"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Image16x9 } from "./Image16x9";
import type { PublicArticle as Article } from "../lib/types/public";

type HeroSettings = { label?: string; heading?: string; description?: string; ctaLabel?: string; ctaHref?: string };

export function Hero({ stories, settings }: { stories: Article[]; settings?: HeroSettings }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(stories.length > 1 ? 1 : 0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const interactionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pausedRef = useRef(false);
  const activeIndexRef = useRef(0);
  const hasMultipleStories = stories.length > 1;

  useEffect(() => () => { if (interactionTimer.current) clearTimeout(interactionTimer.current); }, []);
  useEffect(() => { pausedRef.current = hovering || interacting; }, [hovering, interacting]);
  const moveTo = useCallback((index: number, forward: boolean) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
    setTransitionEnabled(true);
    if (hasMultipleStories && forward && index === 0) setTrackIndex(stories.length + 1);
    else if (hasMultipleStories && !forward && index === stories.length - 1) setTrackIndex(0);
    else setTrackIndex(index + (hasMultipleStories ? 1 : 0));
  }, [hasMultipleStories, stories.length]);
  useEffect(() => {
    if (stories.length < 2) return;
    const timer = setInterval(() => {
      if (!pausedRef.current) moveTo((activeIndexRef.current + 1) % stories.length, true);
    }, 3000);
    return () => clearInterval(timer);
  }, [moveTo, stories.length]);
  const chooseSlide = (index: number) => {
    if (index === activeIndexRef.current) return;
    const current = activeIndexRef.current;
    const forward = current === stories.length - 1 && index === 0 ? true : current === 0 && index === stories.length - 1 ? false : index > current;
    moveTo(index, forward);
    setInteracting(true);
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
    interactionTimer.current = setTimeout(() => setInteracting(false), 700);
  };
  const moveRelative = (direction: 1 | -1) => chooseSlide((activeIndexRef.current + direction + stories.length) % stories.length);
  const renderedSlides = hasMultipleStories ? [{ story: stories[stories.length - 1], logicalIndex: stories.length - 1 }, ...stories.map((story, logicalIndex) => ({ story, logicalIndex })), { story: stories[0], logicalIndex: 0 }] : stories.map((story, logicalIndex) => ({ story, logicalIndex }));
  const handleTrackTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (!hasMultipleStories || event.propertyName !== "transform") return;
    if (trackIndex !== 0 && trackIndex !== stories.length + 1) return;
    setTransitionEnabled(false);
    setTrackIndex(trackIndex === 0 ? stories.length : 1);
    requestAnimationFrame(() => setTransitionEnabled(true));
  };

  return <section className="homepage-hero" aria-label="Featured stories" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false); }}>
    <div className="homepage-hero-inner">
      <div className="hero-stage">
        <div className={`hero-track ${transitionEnabled ? "" : "hero-track-no-transition"}`} onTransitionEnd={handleTrackTransitionEnd} style={{ transform: `translateX(-${trackIndex * 100}%)` }}>
          {renderedSlides.map(({ story, logicalIndex }, index) => {
            const heading = hasMultipleStories ? story.title : settings?.heading ?? story.title;
            const description = hasMultipleStories ? story.excerpt : settings?.description ?? story.excerpt;
            const label = hasMultipleStories ? story.category.name : settings?.label ?? story.category.name;
            const href = hasMultipleStories ? `/articles/${story.slug}` : settings?.ctaHref ?? `/articles/${story.slug}`;
            const date = new Date(story.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const heroImage = story.featuredImage.originalUrl ? { ...story.featuredImage, url: story.featuredImage.originalUrl, width: story.featuredImage.originalWidth ?? story.featuredImage.width, height: story.featuredImage.originalHeight ?? story.featuredImage.height } : story.featuredImage;
            const isActive = hasMultipleStories ? index === trackIndex : true;
            return <div className="hero-slide" key={`${story.id}-${index}`} aria-hidden={!isActive} aria-label={`Slide ${logicalIndex + 1} of ${stories.length}`} aria-roledescription="slide" inert={!isActive} role="group">
              <Link href={`/articles/${story.slug}`} tabIndex={isActive ? 0 : -1} className="hero-image-link card-link" aria-label={`Read ${story.title}`}><Image16x9 src={heroImage} alt={story.title} priority={isActive} sizes="(max-width: 767px) 91vw, (max-width: 1023px) 55vw, min(55vw, 840px)" /></Link>
              <article className="hero-story-card">
                <p className="eyebrow hero-story-label">{label}</p>
                <p className="meta hero-story-date">{date}</p>
                <h1 className="serif hero-story-title">{heading}</h1>
                {description && <p className="hero-story-excerpt">{description}</p>}
                <Link href={href} tabIndex={isActive ? 0 : -1} className="hero-story-action">{settings?.ctaLabel ?? "Read the story"}<span className="arrow" aria-hidden="true">→</span></Link>
              </article>
            </div>;
          })}
        </div>
        {stories.length > 1 && <div className="hero-controls"><button type="button" className="hero-control" aria-label="Previous featured story" onClick={() => moveRelative(-1)}>←</button><div className="hero-pagination" aria-label="Featured story slides">{stories.map((item, index) => <button key={item.id} type="button" className={`hero-dot ${index === activeIndex ? "hero-dot-active" : ""}`} aria-label={`Show ${item.title}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => chooseSlide(index)} />)}</div><button type="button" className="hero-control" aria-label="Next featured story" onClick={() => moveRelative(1)}>→</button></div>}
      </div>
    </div>
  </section>;
}
