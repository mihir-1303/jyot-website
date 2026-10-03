"use client";

import { useMemo, useState } from "react";
import type { PublicCategory, PublicResearch } from "../lib/types/public";
import { ResearchExplorerCard } from "./ResearchExplorerCard";
import { SectionViewAll } from "./SectionHeader";
import styles from "./ResearchExplorer.module.css";

export function ResearchExplorer({ items, topics = [], title = "Explore research" }: { items: PublicResearch[]; topics?: PublicCategory[]; title?: string }) {
  const availableTopics = useMemo(() => [...new Map(topics.filter((topic) => topic.slug && topic.name && items.some((item) => item.category.slug === topic.slug)).map((topic) => [topic.slug, topic])).values()], [items, topics]);
  const editorialTopics = [{ slug: "all", label: "All Research" }, ...availableTopics.map((topic) => ({ slug: topic.slug, label: topic.name }))];
  const [activeTopicSlug, setActiveTopicSlug] = useState("all");
  const activeTopic = editorialTopics.find((topic) => topic.slug === activeTopicSlug) ?? editorialTopics[0];
  const visibleItems = useMemo(() => {
    return activeTopic.slug === "all" ? items : items.filter((item) => item.category.slug === activeTopic.slug);
  }, [activeTopic, items]);

  return <section className={styles.section} aria-labelledby="homepage-research-explorer-title"><div className="page-shell"><div className={styles.heading}><div><p className="eyebrow">Research desk</p><h2 id="homepage-research-explorer-title" className="serif text-3xl md:text-4xl">{title}</h2></div></div><div className={`${styles.grid} ${availableTopics.length === 0 ? styles.gridFull : ""}`}>
    {availableTopics.length > 0 && <nav aria-label="Research topics" className={styles.topics}><p className="meta">Topics</p><div className={styles.topicsList} role="tablist" aria-label="Research categories">{editorialTopics.map((topic) => <button type="button" role="tab" aria-selected={activeTopic.slug === topic.slug} aria-controls="homepage-research-results" className={`${styles.topic} ${activeTopic.slug === topic.slug ? styles.topicActive : ""}`} key={topic.slug} onClick={() => setActiveTopicSlug(topic.slug)}>{topic.label}</button>)}</div></nav>}
    <div id="homepage-research-results" className={styles.results} aria-live="polite">{visibleItems.length ? <div className={styles.researchGrid}>{visibleItems.map((item) => <ResearchExplorerCard item={item} key={item.id} />)}</div> : <p className={styles.empty}>No research available for this topic yet.</p>}</div>
  </div><SectionViewAll href="/research" label="View all research" dark /></div></section>;
}
