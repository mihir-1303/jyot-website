import type { PublicArticle } from "../lib/types/public";
import { ArticleCard } from "./ArticleCard";

export function InsightsShelf({ articles }: { articles: PublicArticle[] }) {
  if (!articles.length) return null;
  return <div className="insights-shelf">{articles.map((article) => <ArticleCard article={article} compact key={article.id} />)}</div>;
}
