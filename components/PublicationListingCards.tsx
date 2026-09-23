import Link from "next/link";
import type { PublicArticle, PublicResearch, PublicVideo } from "../lib/types/public";
import { EditorialImage } from "./EditorialImage";

const date = (value: string, style: "short" | "long" = "short") => new Date(value).toLocaleDateString("en-US", style === "long" ? { month: "long", day: "numeric", year: "numeric" } : { month: "short", day: "numeric", year: "numeric" });

export function PublicationArticleFeature({ article }: { article: PublicArticle }) {
  return <article className="listing-feature"><Link href={`/articles/${article.slug}`} className="listing-feature-image card-link group"><EditorialImage src={article.featuredImage} alt={article.title} priority sizes="(max-width: 767px) 91vw, (max-width: 1023px) 52vw, 56vw" /></Link><div className="listing-feature-copy"><p className="meta">{article.category.name} · {date(article.publishedAt, "long")}</p><h2 className="serif listing-feature-title"><Link href={`/articles/${article.slug}`} className="group-hover:text-[var(--orange)]">{article.title}</Link></h2>{article.excerpt && <p className="listing-feature-excerpt">{article.excerpt}</p>}<p className="meta listing-feature-author">{article.author.name}{article.readTime ? ` · ${article.readTime}` : ""}<span className="listing-arrow" aria-hidden="true">→</span></p></div></article>;
}

export function PublicationArticleCard({ article }: { article: PublicArticle }) {
  return <article className="publication-card"><Link href={`/articles/${article.slug}`} className="card-link group"><EditorialImage src={article.featuredImage} alt={article.title} sizes="(max-width: 767px) 91vw, (max-width: 1023px) 44vw, 29vw" /><div className="publication-card-copy"><p className="meta">{article.category.name} · {date(article.publishedAt)}</p><h3 className="serif publication-card-title group-hover:text-[var(--orange)]">{article.title}</h3>{article.excerpt && <p className="publication-card-excerpt">{article.excerpt}</p>}<p className="meta publication-card-author">{article.author.name}{article.readTime ? ` · ${article.readTime}` : ""}</p></div></Link></article>;
}

export function PublicationVideoFeature({ video }: { video: PublicVideo }) {
  return <article className="listing-feature"><Link href={`/videos/${video.slug}`} className="listing-feature-image card-link group"><div className="listing-video-media"><EditorialImage src={video.thumbnail} alt={video.title} priority sizes="(max-width: 767px) 91vw, (max-width: 1023px) 52vw, 56vw" /><span className="listing-video-play" aria-hidden="true">▶</span>{video.duration && <span className="video-duration">{video.duration}</span>}</div></Link><div className="listing-feature-copy"><p className="meta">{video.category.name} · {date(video.publishedAt, "long")}</p><h2 className="serif listing-feature-title"><Link href={`/videos/${video.slug}`} className="group-hover:text-[var(--orange)]">{video.title}</Link></h2>{video.description && <p className="listing-feature-excerpt">{video.description}</p>}<p className="meta listing-feature-author">{video.author?.name ?? "Jyot"}{video.duration ? ` · ${video.duration}` : ""}<span className="listing-arrow" aria-hidden="true">→</span></p></div></article>;
}

export function PublicationVideoCard({ video }: { video: PublicVideo }) {
  return <article className="publication-card"><Link href={`/videos/${video.slug}`} className="card-link group"><div className="listing-video-media"><EditorialImage src={video.thumbnail} alt={video.title} sizes="(max-width: 767px) 91vw, (max-width: 1023px) 44vw, 29vw" /><span className="listing-video-play" aria-hidden="true">▶</span>{video.duration && <span className="video-duration">{video.duration}</span>}</div><div className="publication-card-copy"><p className="meta">{video.category.name} · {date(video.publishedAt)}</p><h3 className="serif publication-card-title group-hover:text-[var(--orange)]">{video.title}</h3>{video.description && <p className="publication-card-excerpt">{video.description}</p>}<p className="meta publication-card-author">{video.author?.name ?? "Jyot"}{video.provider ? ` · ${video.provider}` : ""}</p></div></Link></article>;
}

export function PublicationResearchFeature({ item }: { item: PublicResearch }) {
  return <article className="listing-feature"><Link href={`/research/${item.slug}`} className="listing-feature-image card-link group"><EditorialImage src={item.coverImage} alt={item.title} priority /></Link><div className="listing-feature-copy"><p className="meta">{item.category.name} · {date(item.publishedAt, "long")}</p><p className="eyebrow listing-type">{item.type}</p><h2 className="serif listing-feature-title"><Link href={`/research/${item.slug}`} className="group-hover:text-[var(--orange)]">{item.title}</Link></h2>{item.description && <p className="listing-feature-excerpt">{item.description}</p>}<p className="meta listing-feature-author">{item.authors.map((author) => author.name).join(" · ") || "Jyot Research"}<span className="listing-arrow" aria-hidden="true">→</span></p></div></article>;
}

export function PublicationResearchCard({ item }: { item: PublicResearch }) {
  return <article className="publication-card"><Link href={`/research/${item.slug}`} className="card-link group"><EditorialImage src={item.coverImage} alt={item.title} /><div className="publication-card-copy"><p className="meta">{item.category.name} · {date(item.publishedAt)}</p><p className="eyebrow listing-type">{item.type}</p><h3 className="serif publication-card-title group-hover:text-[var(--orange)]">{item.title}</h3>{item.description && <p className="publication-card-excerpt">{item.description}</p>}<p className="meta publication-card-author">{item.authors.map((author) => author.name).join(" · ") || "Jyot Research"}</p></div></Link></article>;
}
