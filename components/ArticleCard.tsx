import Link from "next/link";
import type { PublicArticle } from "../lib/types/public";
import { Image16x9 } from "./Image16x9";
import { EditorialCardMeta } from "./EditorialCardMeta";

export function ArticleCard({ article, compact = false }: { article: PublicArticle; compact?: boolean }) {
  return <article><Link href={`/articles/${article.slug}`} className="card-link group block"><Image16x9 src={article.featuredImage} alt={article.title} sizes="(max-width: 767px) 91vw, (max-width: 1023px) 44vw, 29vw" /><div className={compact ? "pt-3" : "pt-4"}><EditorialCardMeta category={article.category.name} publishedAt={article.publishedAt} /><h3 className={`serif mt-1.5 leading-tight transition-colors group-hover:text-[var(--orange)] ${compact ? "text-xl" : "text-2xl md:text-[1.7rem]"}`}>{article.title}</h3>{!compact && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{article.excerpt}</p>}<div className={`flex items-center justify-between border-t pt-2.5 text-[.62rem] font-bold tracking-[.04em] text-[var(--muted)] divider ${compact ? "mt-3" : "mt-4"}`}><span>{article.author.name}{article.readTime ? ` · ${article.readTime}` : ""}</span><span className="arrow text-lg" aria-hidden="true">→</span></div></div></Link></article>;
}
