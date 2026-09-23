import Link from "next/link";
import type { PublicResearch } from "../lib/types/public";
import { Image16x9 } from "./Image16x9";

export function ResearchCard({ item, compact = false }: { item: PublicResearch; compact?: boolean }) {
  return <article><Link href={`/research/${item.slug}`} className="card-link group block"><Image16x9 src={item.coverImage} alt={item.title} sizes="(max-width: 767px) 91vw, 44vw" /><div className="pt-3"><p className="eyebrow">{item.type}</p><h3 className={`serif mt-1.5 leading-tight transition-colors group-hover:text-[var(--orange)] ${compact ? "text-xl" : "text-2xl md:text-3xl"}`}>{item.title}</h3>{!compact && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>}<div className="mt-3 flex items-center justify-between border-t pt-2.5 text-[.62rem] font-bold tracking-[.06em] text-[var(--muted)] divider"><span>{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}{item.authors[0]?.name ? ` · ${item.authors[0].name}` : ""}</span><span className="arrow text-lg" aria-hidden="true">→</span></div></div></Link></article>;
}
