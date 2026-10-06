import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { PublicationArticleCard, PublicationVideoCard, PublicationResearchCard } from "../../../components/PublicationListingCards";
import { getPublishedArticles, getPublishedCategories, getPublishedResearch, getPublishedVideos } from "../../../lib/data/public";
import { editorialMetadata } from "../../../lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug;
  const category = (await getPublishedCategories()).find((item) => item.slug === slug);
  return category ? editorialMetadata({ title: category.name, description: category.description || `Jyot content in ${category.name}.`, path: `/categories/${category.slug}` }) : { title: "Category | Jyot", robots: { index: false } };
}

export default async function CategoryPage({ params }: Props) {
  const slug = (await params).slug.trim().toLowerCase();
  const [category, articles, videos, research] = await Promise.all([
    getPublishedCategories().then((items) => items.find((item) => item.slug === slug)),
    getPublishedArticles(undefined, { category: slug }),
    getPublishedVideos(undefined, { category: slug }),
    getPublishedResearch(undefined, { category: slug }),
  ]);
  if (!category) notFound();
  return <main className="listing-page page-shell section"><Breadcrumbs items={[{ label: "Categories", href: "/categories" }, { label: category.name }]} /><header className="listing-page-header"><p className="eyebrow">Jyot · Category</p><h1 className="serif listing-page-title">{category.name}</h1>{category.description && <p className="listing-intro">{category.description}</p>}</header>{articles.length > 0 && <section className="listing-latest-section"><div className="listing-section-heading"><h2 className="serif">Articles</h2></div><div className="publication-grid">{articles.map((article) => <PublicationArticleCard article={article} key={article.id} />)}</div></section>}{videos.length > 0 && <section className="listing-latest-section"><div className="listing-section-heading"><h2 className="serif">Videos</h2></div><div className="publication-grid">{videos.map((video) => <PublicationVideoCard video={video} key={video.id} />)}</div></section>}{research.length > 0 && <section className="listing-latest-section"><div className="listing-section-heading"><h2 className="serif">Research</h2></div><div className="publication-grid">{research.map((item) => <PublicationResearchCard item={item} key={item.id} />)}</div></section>}{articles.length === 0 && videos.length === 0 && research.length === 0 && <p className="listing-empty">No published content in this category yet.</p>}</main>;
}
