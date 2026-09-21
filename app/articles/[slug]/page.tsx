import { notFound } from "next/navigation";
import { ArticleCard } from "../../../components/ArticleCard";
import { EditorialImage } from "../../../components/EditorialImage";
import { JsonLd } from "../../../components/JsonLd";
import { StructuredContent } from "../../../components/StructuredContent";
import { getPublishedArticleBySlug, getPublishedArticles } from "../../../lib/data/public";
import { canonical, editorialMetadata } from "../../../lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const item = await getPublishedArticleBySlug((await params).slug);
  return item ? editorialMetadata({ title: item.title, description: item.excerpt, path: `/articles/${item.slug}`, image: item.featuredImage.url, type: "article" }) : { title: "Article | Jyot", robots: { index: false } };
}

export default async function ArticlePage({ params }: Props) {
  const item = await getPublishedArticleBySlug((await params).slug);
  if (!item) notFound();

  let related = [] as Awaited<ReturnType<typeof getPublishedArticles>>;
  try {
    const articles = await getPublishedArticles();
    related = articles.filter((article) => article.slug !== item.slug && article.category.slug === item.category.slug).slice(0, 3);
    if (related.length < 3) related = [...related, ...articles.filter((article) => article.slug !== item.slug && !related.some((relatedArticle) => relatedArticle.slug === article.slug)).slice(0, 3 - related.length)];
  } catch {
    related = [];
  }

  const data = { "@context": "https://schema.org", "@type": "Article", headline: item.title, description: item.excerpt, image: item.featuredImage.url, datePublished: item.publishedAt, dateModified: item.updatedAt, author: { "@type": "Person", name: item.author.name }, articleSection: item.category.name, mainEntityOfPage: canonical(`/articles/${item.slug}`) };
  const publishedDate = new Date(item.publishedAt).toLocaleDateString("en-US", { dateStyle: "long" });

  return <main className="article-page page-shell section">
    <JsonLd data={data} />
    <div className="article-layout">
      <article className="article-main">
        <header className="article-header">
          <div className="article-kicker"><p className="eyebrow">{item.category.name}</p><span className="article-kicker-rule" aria-hidden="true" /><p className="meta">{publishedDate}</p></div>
          <h1 className="serif article-title">{item.title}</h1>
          {item.excerpt && <p className="article-deck">{item.excerpt}</p>}
        </header>
        <div className="article-hero"><EditorialImage src={item.featuredImage} alt={item.featuredImage.altText || item.title} priority /></div>
        <div className="article-body"><StructuredContent content={item.content} /></div>
      </article>
      <aside className="article-author" aria-label="Author information">
        <p className="eyebrow">Author</p>
        <div className="article-author-rule" aria-hidden="true" />
        <h2 className="serif article-author-name">{item.author.name}</h2>
        {item.author.bio && <p className="article-author-bio">{item.author.bio}</p>}
        {item.readTime && <p className="meta article-read-time">{item.readTime}</p>}
      </aside>
    </div>
    {related.length > 0 && <section className="article-related" aria-labelledby="related-articles"><div className="article-related-heading"><p className="eyebrow">Continue reading</p><h2 id="related-articles" className="serif">Related Articles</h2></div><div className="article-related-grid">{related.map((article) => <ArticleCard article={article} compact key={article.id} />)}</div></section>}
  </main>;
}
