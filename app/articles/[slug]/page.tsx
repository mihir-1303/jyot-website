import { notFound } from "next/navigation";
import { ArticleCard } from "../../../components/ArticleCard";
import { EditorialImage } from "../../../components/EditorialImage";
import { StructuredContent } from "../../../components/StructuredContent";
import { getPublishedArticleBySlug, getRelatedPublishedArticles } from "../../../lib/data/public";
import { canonical, editorialMetadata } from "../../../lib/seo";
import { EditorialHeader } from "../../../components/EditorialHeader";
import { articleToEditorialContent } from "../../../lib/editorial";
import { ContentDetailLayout } from "../../../components/ContentDetailLayout";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const item = await getPublishedArticleBySlug((await params).slug);
  return item ? editorialMetadata({ title: item.title, description: item.excerpt, path: `/articles/${item.slug}`, image: item.featuredImage.url, type: "article" }) : { title: "Article | Jyot", robots: { index: false } };
}

export default async function ArticlePage({ params }: Props) {
  const item = await getPublishedArticleBySlug((await params).slug);
  if (!item) notFound();

  const authors = Array.isArray(item.authors) ? item.authors : [];
  const categories = Array.isArray(item.categories) ? item.categories : [];
  const data = { "@context": "https://schema.org", "@type": "Article", headline: item.title, description: item.excerpt, image: item.featuredImage.url, datePublished: item.publishedAt, dateModified: item.updatedAt, author: authors.map((author) => ({ "@type": "Person", name: author.name })), articleSection: categories.map((category) => category.name), mainEntityOfPage: canonical(`/articles/${item.slug}`) };
  const related = await getRelatedPublishedArticles(item.id, item.category.id).catch(() => []);
  const editorial = articleToEditorialContent(item);

  return <ContentDetailLayout breadcrumbs={[{ label: "Articles", href: "/articles" }, { label: item.title }]} jsonLd={data}>
    <div className="article-layout">
      <article className="article-main">
        <EditorialHeader content={editorial} eyebrow={categories.map((category) => category.name).join(" · ")} showByline={false} />
        <div className="article-hero"><EditorialImage src={item.featuredImage} alt={item.featuredImage.altText || item.title} priority /></div>
        <div className="article-body"><StructuredContent content={item.content} /></div>
      </article>
      <aside className="article-author" aria-label="Author information">
        <p className="eyebrow">Author</p>
        <div className="article-author-rule" aria-hidden="true" />
        {authors.map((author) => <div key={author.id}><h2 className="serif article-author-name">{author.name}</h2>{author.bio && <p className="article-author-bio">{author.bio}</p>}</div>)}
        {item.readTime && <p className="meta article-read-time">{item.readTime}</p>}
      </aside>
    </div>
    {related.length > 0 && <section className="article-related" aria-labelledby="related-articles"><div className="article-related-heading"><p className="eyebrow">Continue reading</p><h2 id="related-articles" className="serif">Related Articles</h2></div><div className="article-related-grid">{related.map((article) => <ArticleCard article={article} compact key={article.id} />)}</div></section>}
  </ContentDetailLayout>;
}
