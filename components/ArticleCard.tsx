import type { PublicArticle } from "../lib/types/public";
import { Image16x9 } from "./Image16x9";

export function ArticleCard({ article, compact = false }: { article: PublicArticle; compact?: boolean }) {
  return <article><a href={`/articles/${article.slug}`} className="card-link group block"><Image16x9 src={article.featuredImage} alt={article.title} /><div className={compact ? "pt-3" : "pt-4"}><p className="meta">{article.category.name} · {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p><h3 className={`serif mt-1.5 leading-tight transition-colors group-hover:text-[var(--orange)] ${compact ? "text-xl" : "text-2xl md:text-[1.7rem]"}`}>{article.title}</h3>{!compact && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{article.excerpt}</p>}<div className={`flex items-center justify-between border-t pt-2.5 text-[.62rem] font-bold tracking-[.04em] text-[var(--muted)] divider ${compact ? "mt-3" : "mt-4"}`}><span>{article.author.name}{article.readTime ? ` · ${article.readTime}` : ""}</span><span className="arrow text-lg" aria-hidden="true">→</span></div></div></a></article>;
}
