import Link from "next/link";
import type { PublicCategory } from "../lib/types/public";

export function TopicNav({ articleCategories, activeTopic }: { articleCategories: PublicCategory[]; activeTopic?: string }) {
  const unique = [...new Map(articleCategories.filter((category) => category.name).map((category) => [category.id, category])).values()];
  if (!unique.length) return null;
  return <nav aria-label="Topics" className="border-y divider"><div className="page-shell flex gap-5 overflow-x-auto py-2.5 text-[.62rem] font-bold uppercase tracking-[.12em] text-[var(--muted)]"><Link aria-current={!activeTopic ? "page" : undefined} className={`shrink-0 transition-colors hover:text-[var(--orange)] ${!activeTopic ? "text-[var(--foreground)]" : ""}`} href="/">All</Link>{unique.map((category) => <Link aria-current={activeTopic === category.slug ? "page" : undefined} className={`shrink-0 transition-colors hover:text-[var(--orange)] ${activeTopic === category.slug ? "text-[var(--foreground)]" : ""}`} href={`/articles?category=${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>)}</div></nav>;
}
