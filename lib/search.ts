import "server-only";
import { connectToDatabase } from "./db/mongodb";
import { Article, Author, Category, Research, Tag, Video } from "./db/models";
import { normalizeQuery } from "./search-utils";
import { mediaUrlForAsset } from "./media-url";

export type SearchType = "all" | "articles" | "research" | "videos" | "authors" | "topics";
export type SearchSort = "relevance" | "newest" | "oldest";
type ContentType = "article" | "research" | "video";
type AnyRow = { [key: string]: unknown; _id?: unknown; name?: string; slug?: string; objectKey?: string; sourceUrl?: string; altText?: string; variants?: { presentation16x9?: { objectKey?: string } }; category?: AnyRow; author?: AnyRow; authors?: AnyRow[]; publishedAt?: Date | string; title?: string; excerpt?: string; description?: string };
export type SearchResult = { type: ContentType | "author" | "category" | "tag"; title: string; slug: string; description: string; category?: string; author?: string; date?: string; score: number; image?: { url: string; altText?: string } };

const publicFilter = { status: "published", $or: [{ publishedAt: { $exists: false } }, { publishedAt: { $lte: new Date() } }] };
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const text = (value: unknown) => String(value ?? "");
const media = (value: unknown) => { const item = value as AnyRow | undefined; if (!item) return undefined; const variant = item.variants?.presentation16x9; const key = variant?.objectKey ?? item.objectKey; const url = mediaUrlForAsset(key, item.sourceUrl); return url ? { url, altText: item.altText } : undefined; };
const scoreResult = (title: string, description: string, slug: string, term: string) => { const q = term.toLowerCase(); const t = title.toLowerCase(); const s = slug.toLowerCase(); if (t === q) return 100; if (t.startsWith(q)) return 90; if (t.includes(q)) return 75; if (s.includes(q)) return 65; if (description.toLowerCase().includes(q)) return 35; return 15; };

export async function searchPublished(query: string, options: { type?: SearchType; sort?: SearchSort; page?: number; limit?: number } = {}) {
  const term = normalizeQuery(query); const type = options.type ?? "all"; const sort = options.sort ?? (term ? "relevance" : "newest"); const page = Math.max(1, options.page ?? 1); const limit = Math.min(Math.max(1, options.limit ?? 12), 24);
  if (term.length < 2) return { results: [], total: 0, query: term, type, sort };
  await connectToDatabase();
  const rx = new RegExp(escapeRegex(term), "i");
  const [authors, categories, tags] = await Promise.all([Author.find({ $or: [{ name: rx }, { slug: rx }] }).select("name slug").lean(), Category.find({ $or: [{ name: rx }, { slug: rx }] }).select("name slug").lean(), Tag.find({ $or: [{ name: rx }, { slug: rx }] }).select("name slug").lean()]) as [AnyRow[], AnyRow[], AnyRow[]];
  const contentFilter = { ...publicFilter, $or: [{ title: rx }, { slug: rx }, { excerpt: rx }, { description: rx }, { author: { $in: authors.map((item) => item._id) } }, { authors: { $in: authors.map((item) => item._id) } }, { category: { $in: categories.map((item) => item._id) } }, { tags: { $in: tags.map((item) => item._id) } }] };
  const publishedTagIds = new Set((await Article.find({ ...publicFilter, tags: { $in: tags.map((item) => item._id) } }).distinct("tags")).map(String));
  const contentLimit = 250;
  const [articleRows, videoRows, researchRows] = await Promise.all([
    type === "all" || type === "articles" || type === "authors" || type === "topics" ? Article.find(contentFilter).populate([{ path: "category", select: "name" }, { path: "author", select: "name" }, { path: "coverMedia", select: "sourceUrl objectKey altText variants" }]).select("title slug excerpt category author coverMedia publishedAt").limit(contentLimit).lean() : [],
    type === "all" || type === "videos" || type === "authors" || type === "topics" ? Video.find(contentFilter).populate([{ path: "category", select: "name" }, { path: "author", select: "name" }, { path: "thumbnail", select: "sourceUrl objectKey altText variants" }]).select("title slug description category author thumbnail publishedAt").limit(contentLimit).lean() : [],
    type === "all" || type === "research" || type === "authors" || type === "topics" ? Research.find(contentFilter).populate([{ path: "category", select: "name" }, { path: "authors", select: "name" }, { path: "coverMedia", select: "sourceUrl objectKey altText variants" }]).select("title slug description category authors coverMedia publishedAt").limit(contentLimit).lean() : [],
  ]);
  const makeContent = (kind: ContentType, rows: unknown[], descriptionKey: "excerpt" | "description", imageKey: "coverMedia" | "thumbnail") => rows.map((value) => { const item = value as AnyRow; const description = text(item[descriptionKey]); const people = Array.isArray(item.authors) ? item.authors : item.author ? [item.author] : []; return { type: kind, title: text(item.title), slug: text(item.slug), description, category: text(item.category?.name), author: people.map((person) => text(person?.name)).filter(Boolean).join(", "), date: item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined, score: scoreResult(text(item.title), description, text(item.slug), term), image: media(item[imageKey]) } satisfies SearchResult; });
  const contentResults = [...makeContent("article", articleRows, "excerpt", "coverMedia"), ...makeContent("video", videoRows, "description", "thumbnail"), ...makeContent("research", researchRows, "description", "coverMedia")];
  const results: SearchResult[] = type === "all" || type === "articles" || type === "research" || type === "videos" ? contentResults.filter((item) => type === "all" || (type === "articles" && item.type === "article") || (type === "research" && item.type === "research") || (type === "videos" && item.type === "video")) : [];
  const usedAuthors = new Set(results.flatMap((item) => item.author ? item.author.split(", ") : [])); const usedCategories = new Set(results.map((item) => item.category).filter(Boolean));
  if (type === "all" || type === "authors") for (const item of authors) if (usedAuthors.has(text(item.name))) results.push({ type: "author", title: text(item.name), slug: text(item.slug), description: "Author", score: scoreResult(text(item.name), "", text(item.slug), term) });
  if (type === "all" || type === "topics") { for (const item of categories) if (usedCategories.has(text(item.name))) results.push({ type: "category", title: text(item.name), slug: text(item.slug), description: "Topic", score: scoreResult(text(item.name), "", text(item.slug), term) }); for (const item of tags) if (publishedTagIds.has(String(item._id))) results.push({ type: "tag", title: text(item.name), slug: text(item.slug), description: "Tag", score: scoreResult(text(item.name), "", text(item.slug), term) }); }
  results.sort((a, b) => sort === "relevance" ? b.score - a.score || a.title.localeCompare(b.title) : sort === "newest" ? (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title) : (a.date ?? "").localeCompare(b.date ?? "") || a.title.localeCompare(b.title));
  const start = (page - 1) * limit; return { results: results.slice(start, start + limit), total: results.length, query: term, type, sort };
}
