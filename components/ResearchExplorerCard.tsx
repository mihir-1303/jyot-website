import Link from "next/link";
import type { PublicResearch } from "../lib/types/public";
import { Image16x9 } from "./Image16x9";

export function ResearchExplorerCard({ item }: { item: PublicResearch }) {
  return <article className="research-explorer-card"><Link className="card-link group block" href={`/research/${item.slug}`}><Image16x9 src={item.coverImage} alt={item.title} sizes="(max-width: 767px) 91vw, (max-width: 1023px) 44vw, 29vw" /><div className="research-explorer-card-copy"><p className="meta">{item.category.name} · {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p><h3 className="research-explorer-card-title serif transition-colors group-hover:text-[var(--orange)]">{item.title}</h3><p className="research-explorer-card-author">— {item.authors.map((author) => author.name).join(" · ") || "Jyot Research"}</p></div></Link></article>;
}
