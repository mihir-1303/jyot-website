import type { PublicArticle } from "../lib/types/public";
import { Image16x9 } from "./Image16x9";

export function ArticleRow({ article }: { article: PublicArticle }) {
  return <article className="article-row"><a className="card-link group" href={`/articles/${article.slug}`}><Image16x9 src={article.featuredImage} alt={article.title} /></a><div className="article-row-copy"><a className="group" href={`/articles/${article.slug}`}><p className="meta">{article.category.name} · {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p><h2 className="serif mt-1.5 text-2xl leading-tight transition-colors group-hover:text-[var(--orange)]">{article.title}</h2><p className="article-row-excerpt mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{article.excerpt}</p><p className="meta mt-3">{article.author.name}{article.readTime ? ` · ${article.readTime}` : ""} <span className="arrow ml-2 text-lg">→</span></p></a></div></article>;
}
