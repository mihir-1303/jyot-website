import type { PublicArticle, PublicVideo } from "./types/public";

export type EditorialContent = {
  type: "article" | "video";
  title: string;
  slug: string;
  excerpt: string;
  author?: PublicArticle["author"] | PublicVideo["author"];
  category: PublicArticle["category"] | PublicVideo["category"];
  publishedAt: string;
  canonicalPath: string;
  primaryMedia:
    | { type: "image"; asset: PublicArticle["featuredImage"] }
    | { type: "video"; asset: PublicVideo["thumbnail"]; videoUrl?: string };
};

export function articleToEditorialContent(article: PublicArticle): EditorialContent {
  return {
    type: "article",
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    author: article.author,
    category: article.category,
    publishedAt: article.publishedAt,
    canonicalPath: `/articles/${article.slug}`,
    primaryMedia: { type: "image", asset: article.featuredImage },
  };
}

export function videoToEditorialContent(video: PublicVideo): EditorialContent {
  return {
    type: "video",
    title: video.title,
    slug: video.slug,
    excerpt: video.description,
    author: video.author,
    category: video.category,
    publishedAt: video.publishedAt,
    canonicalPath: `/videos/${video.slug}`,
    primaryMedia: { type: "video", asset: video.thumbnail, videoUrl: video.videoUrl },
  };
}
