import type { EditorialContent } from "../lib/editorial";

export function EditorialHeader({ content, showExcerpt = true, showByline = true }: { content: EditorialContent; showExcerpt?: boolean; showByline?: boolean }) {
  return <header className="article-header">
    <div className="article-kicker"><p className="eyebrow">{content.category.name}</p><span className="article-kicker-rule" aria-hidden="true" /><p className="meta">{new Date(content.publishedAt).toLocaleDateString("en-US", { dateStyle: "long" })}</p></div>
    <h1 className="serif article-title">{content.title}</h1>
    {showExcerpt && content.excerpt && <p className="article-deck">{content.excerpt}</p>}
    {showByline && <p className="meta editorial-byline">{content.author?.name ?? "Jyot"}</p>}
  </header>;
}
