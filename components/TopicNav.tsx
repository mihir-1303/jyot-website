import Link from "next/link";
import type { PublicCategory } from "../lib/types/public";

export function TopicNav({ categories }: { categories: PublicCategory[] }) {
  const unique = [...new Map(categories.filter((category) => category.name).map((category) => [category.id, category])).values()];
  if (!unique.length) return null;
  return <nav aria-label="Topics" className="border-y divider"><div className="page-shell flex gap-5 overflow-x-auto py-2.5 text-[.62rem] font-bold uppercase tracking-[.12em] text-[var(--muted)]">{unique.map((category) => <Link className="shrink-0 transition-colors hover:text-[var(--orange)]" href={`/articles?category=${encodeURIComponent(category.slug)}`} key={category.id}>{category.name}</Link>)}</div></nav>;
}
