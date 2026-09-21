import "server-only";
import { connectToDatabase } from "../db/mongodb";
import { Article, Author, Category, HomepageConfig, MediaAsset, Research, Tag, User, Video } from "../db/models";

export const repositories = { users: User, authors: Author, categories: Category, tags: Tag, articles: Article, videos: Video, research: Research, media: MediaAsset, homepage: HomepageConfig };
export { connectToDatabase };
