"use client";

import { useMemo, useState } from "react";
import type { PublicResearch } from "../lib/types/public";
import { ResearchExplorerCard } from "./ResearchExplorerCard";
import { SectionViewAll } from "./SectionHeader";
import styles from "./ResearchExplorer.module.css";

type EditorialTopic = { slug: string; label: string; categorySlugs: readonly string[] };

const editorialTopics: EditorialTopic[] = [
  { slug: "all", label: "All Research", categorySlugs: [] },
  { slug: "economy", label: "Economy", categorySlugs: ["economy"] },
  { slug: "technology", label: "Technology", categorySlugs: ["technology"] },
  { slug: "climate", label: "Climate", categorySlugs: ["climate", "climate-environment"] },
  { slug: "geopolitics", label: "Geopolitics", categorySlugs: ["geopolitics", "international-affairs", "international"] },
  { slug: "society", label: "Society", categorySlugs: ["society"] },
  { slug: "education", label: "Education", categorySlugs: ["education"] },
  { slug: "science", label: "Science", categorySlugs: ["science"] },
  { slug: "defence-security", label: "Defence & Security", categorySlugs: ["defence-security", "defense-security", "defence", "defense", "security"] },
  { slug: "international-relations", label: "International Relations", categorySlugs: ["international-relations", "international-affairs", "international"] },
];

export function ResearchExplorer({ items, title = "Explore research" }: { items: PublicResearch[]; title?: string }) {
  const [activeTopicSlug, setActiveTopicSlug] = useState("all");
  const activeTopic = editorialTopics.find((topic) => topic.slug === activeTopicSlug) ?? editorialTopics[0];
  const visibleItems = useMemo(() => {
    return activeTopic.slug === "all" ? items : items.filter((item) => activeTopic.categorySlugs.includes(item.category.slug));
  }, [activeTopic, items]);

  if (!items.length) return null;

  return <section className={styles.section} aria-labelledby="homepage-research-explorer-title"><div className="page-shell"><div className={styles.heading}><div><p className="eyebrow">Research desk</p><h2 id="homepage-research-explorer-title" className="serif text-3xl md:text-4xl">{title}</h2></div></div><div className={styles.grid}>
    <nav aria-label="Research topics" className={styles.topics}><p className="meta">Topics</p><div className={styles.topicsList} role="tablist" aria-label="Research categories">{editorialTopics.map((topic) => <button type="button" role="tab" aria-selected={activeTopic.slug === topic.slug} aria-controls="homepage-research-results" className={`${styles.topic} ${activeTopic.slug === topic.slug ? styles.topicActive : ""}`} key={topic.slug} onClick={() => setActiveTopicSlug(topic.slug)}>{topic.label}</button>)}</div></nav>
    <div id="homepage-research-results" className={styles.results} aria-live="polite">{visibleItems.length ? <div className={styles.researchGrid}>{visibleItems.map((item) => <ResearchExplorerCard item={item} key={item.id} />)}</div> : <p className={styles.empty}>No research available in this topic yet.</p>}</div>
  </div><SectionViewAll href="/research" label="View all research" dark /></div></section>;
}
