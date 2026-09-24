import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { PopulateOptions } from "mongoose";
import { parseRichText, richTextPlainText } from "../rich-text";
import { mediaDeliveryUrl, mediaSourceFallback } from "../media-url";
import { connectToDatabase } from "../db/mongodb";
import { Article, Author, Category, Collection, HomepageConfig, MediaAsset, Research, Video } from "../db/models";
import type { PublicArticle, PublicAuthor, PublicCategory, PublicCollection, PublicCollectionItem, PublicCollectionSummary, PublicHomepageData, PublicMediaAsset, PublicResearch, PublicSection, PublicVideo } from "../types/public";

const publicFilter = () => ({ status: "published", $or: [{ publishedAt: { $exists: false } }, { publishedAt: { $lte: new Date() } }] });
const articlePopulate = [{ path: "coverMedia" }, { path: "author" }, { path: "category" }, { path: "tags" }];
const publicMediaSelect = "objectKey sourceUrl altText caption width height variants";
const videoPopulate = [{ path: "thumbnail" }, { path: "media", select: publicMediaSelect }, { path: "author" }, { path: "category" }];
const researchPopulate = [{ path: "coverMedia" }, { path: "authors" }, { path: "category" }, { path: "pdfMedia" }];
const homepageArticlePopulate = [{ path: "coverMedia", select: publicMediaSelect }, { path: "author", select: "name slug bio" }, { path: "category", select: "name slug description" }];
const homepageVideoPopulate = [{ path: "thumbnail", select: publicMediaSelect }, { path: "author", select: "name slug bio" }, { path: "category", select: "name slug description" }];
const homepageResearchPopulate = [{ path: "coverMedia", select: publicMediaSelect }, { path: "authors", select: "name slug bio" }, { path: "category", select: "name slug description" }];
const homepageArticleSelect = "title slug excerpt featured publishedAt createdAt updatedAt coverMedia author category";
const homepageVideoSelect = "title slug description thumbnail provider sourceType externalUrl duration featured publishedAt createdAt updatedAt author category";
const homepageResearchSelect = "title slug description coverMedia authors category type featured publishedAt createdAt updatedAt";
const PUBLIC_LIST_REVALIDATE = 120;
const PUBLIC_DETAIL_REVALIDATE = 300;
const PUBLIC_HOMEPAGE_REVALIDATE = 60;
const idOf = (value: unknown) => String((value as { _id?: unknown })?._id ?? value ?? "");
const dateOf = (value: unknown) => value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();
const normalizeSlug = (value: string) => { try { return decodeURIComponent(value).trim(); } catch { return value.trim(); } };
const deliveryUrl = (objectKey?: string) => mediaDeliveryUrl(objectKey);
const uncroppedSourceUrl = (sourceUrl?: string) => sourceUrl?.replace(/([?&])fit=crop(&?)/, "$1fit=max$2");
const media = (value: unknown): PublicMediaAsset => { const item = value as { _id?: unknown; objectKey?: string; sourceUrl?: string; altText?: string; caption?: string; width?: number; height?: number; variants?: { original?: { objectKey: string; width?: number; height?: number }; presentation16x9?: { objectKey: string; width?: number; height?: number } } }; const variant = item.variants?.presentation16x9; const original = item.variants?.original; const key = variant?.objectKey ?? item.objectKey; const originalKey = original?.objectKey ?? item.objectKey; const sourceUrl = uncroppedSourceUrl(mediaSourceFallback(item.sourceUrl)); const originalUrl = deliveryUrl(originalKey) ?? sourceUrl; const url = deliveryUrl(key) ?? sourceUrl ?? originalUrl ?? ""; return { id: idOf(item), url, originalUrl, altText: item.altText ?? "", caption: item.caption, width: variant?.width ?? item.width, height: variant?.height ?? item.height, originalWidth: original?.width ?? item.width, originalHeight: original?.height ?? item.height }; };
const author = (value: unknown): PublicAuthor => { const item = value as { _id?: unknown; name?: string; slug?: string; bio?: string }; return { id: idOf(item), name: item.name ?? "", slug: item.slug ?? "", bio: item.bio }; };
const category = (value: unknown): PublicCategory => { const item = value as { _id?: unknown; name?: string; slug?: string; description?: string }; return { id: idOf(item), name: item.name ?? "", slug: item.slug ?? "", description: item.description }; };
const articleDto = (value: unknown): PublicArticle => { const item = value as Record<string, unknown>; return { id: idOf(item), title: String(item.title), slug: String(item.slug), excerpt: String(item.excerpt ?? ""), content: item.content ?? "", featuredImage: media(item.coverMedia), author: author(item.author), category: category(item.category), tags: Array.isArray(item.tags) ? item.tags.map(String) : [], status: "published", featured: Boolean(item.featured), publishedAt: dateOf(item.publishedAt), createdAt: dateOf(item.createdAt), updatedAt: dateOf(item.updatedAt), readTime: item.readTime ? String(item.readTime) : undefined }; };
const videoDto = (value: unknown): PublicVideo => { const item = value as Record<string, unknown>; const sourceType = item.sourceType as PublicVideo["sourceType"]; const mediaAsset = item.media ? media(item.media) : undefined; const descriptionContent = parseRichText(item.description); return { id: idOf(item), title: String(item.title), slug: String(item.slug), description: richTextPlainText(descriptionContent), descriptionContent, thumbnail: media(item.thumbnail), provider: item.provider as PublicVideo["provider"], sourceType, videoUrl: item.externalUrl ? String(item.externalUrl) : sourceType === "r2" ? mediaAsset?.originalUrl ?? mediaAsset?.url : undefined, duration: item.duration ? String(item.duration) : undefined, author: item.author ? author(item.author) : undefined, category: category(item.category), status: "published", featured: Boolean(item.featured), publishedAt: dateOf(item.publishedAt), createdAt: dateOf(item.createdAt), updatedAt: dateOf(item.updatedAt) }; };
const researchDto = (value: unknown): PublicResearch => { const item = value as Record<string, unknown>; return { id: idOf(item), title: String(item.title), slug: String(item.slug), description: String(item.description ?? ""), content: item.content ?? "", coverImage: media(item.coverMedia), authors: Array.isArray(item.authors) ? item.authors.map(author) : [], category: category(item.category), type: String(item.type ?? "Research"), status: "published", featured: Boolean(item.featured), publishedAt: dateOf(item.publishedAt), createdAt: dateOf(item.createdAt), updatedAt: dateOf(item.updatedAt), pdfMedia: item.pdfMedia ? media(item.pdfMedia) : undefined }; };

type PublicQueryOptions = { homepage?: boolean; category?: string };
type PublicContentType = "articles" | "videos" | "research";
const contentModels = { articles: Article, videos: Video, research: Research } as const;
type HomepageQueryPlan = { ids: string[]; latestLimit: number; categoryLimits: Map<string, number>; featuredLimit?: number };
type HomepageModel = typeof Article | typeof Video | typeof Research;

const validIds = (ids: string[]) => ids.filter((id) => /^[a-f\d]{24}$/i.test(id));
const addLimit = (limits: Map<string, number>, categoryId: string | undefined, limit: number) => {
  if (!categoryId || limit < 1) return;
  limits.set(categoryId, Math.max(limits.get(categoryId) ?? 0, limit));
};
function homepagePlan(sections: PublicSection[]): { articles: HomepageQueryPlan; videos: HomepageQueryPlan; research: HomepageQueryPlan; collections: { ids: string[]; latestLimit: number } } {
  const plans = {
    articles: { ids: new Set<string>(), latestLimit: 8, categoryLimits: new Map<string, number>(), featuredLimit: undefined as number | undefined },
    videos: { ids: new Set<string>(), latestLimit: 8, categoryLimits: new Map<string, number>(), featuredLimit: undefined as number | undefined },
    research: { ids: new Set<string>(), latestLimit: 8, categoryLimits: new Map<string, number>(), featuredLimit: undefined as number | undefined },
  };
  const collections = { ids: new Set<string>(), latestLimit: 0 };
  for (const section of sections) {
    const content = section.content;
    const limit = content?.limit ?? 3;
    const ids = content?.ids ?? [];
    if (section.type === "collection") {
      ids.forEach((id) => collections.ids.add(String(id)));
      if (!ids.length && content?.mode === "latest") collections.latestLimit = Math.max(collections.latestLimit, 1);
      continue;
    }
    const plan = section.type === "videos" ? plans.videos : section.type === "research" || section.type === "research-explorer" ? plans.research : plans.articles;
    ids.forEach((id) => plan.ids.add(String(id)));
    if (content?.mode === "latest" || !content) {
      plan.latestLimit = Math.max(plan.latestLimit, limit);
      addLimit(plan.categoryLimits, content?.categoryId, limit);
    }
    if (section.type === "hero") plan.featuredLimit = 5;
  }
  return {
    articles: { ids: [...plans.articles.ids], latestLimit: plans.articles.latestLimit, categoryLimits: plans.articles.categoryLimits, featuredLimit: plans.articles.featuredLimit },
    videos: { ids: [...plans.videos.ids], latestLimit: plans.videos.latestLimit, categoryLimits: plans.videos.categoryLimits },
    research: { ids: [...plans.research.ids], latestLimit: plans.research.latestLimit, categoryLimits: plans.research.categoryLimits },
    collections: { ids: [...collections.ids], latestLimit: collections.latestLimit },
  };
}

async function getHomepageContent<T>(model: HomepageModel, select: string, populate: PopulateOptions[], plan: HomepageQueryPlan, mapper: (value: unknown) => T): Promise<T[]> {
  const ids = validIds(plan.ids);
  const base = publicFilter();
  const queries: Promise<unknown[]>[] = [];
  if (ids.length) queries.push(model.find({ ...base, _id: { $in: ids } }).select(select).populate(populate).lean().exec() as Promise<unknown[]>);
  if (plan.latestLimit > 0) queries.push(model.find({ ...base, ...(ids.length ? { _id: { $nin: ids } } : {}) }).sort({ publishedAt: -1 }).limit(plan.latestLimit).select(select).populate(populate).lean().exec() as Promise<unknown[]>);
  for (const [categoryId, limit] of plan.categoryLimits) queries.push(model.find({ ...base, category: categoryId, ...(ids.length ? { _id: { $nin: ids } } : {}) }).sort({ publishedAt: -1 }).limit(limit).select(select).populate(populate).lean().exec() as Promise<unknown[]>);
  if (plan.featuredLimit) queries.push(model.find({ ...base, ...(ids.length ? { _id: { $nin: ids } } : {}) }).sort({ featured: -1, publishedAt: -1 }).limit(plan.featuredLimit).select(select).populate(populate).lean().exec() as Promise<unknown[]>);
  const values = (await Promise.all(queries)).flat();
  const unique = new Map<string, T>();
  for (const value of values) unique.set(idOf(value), mapper(value));
  return [...unique.values()].sort((a, b) => String((b as { publishedAt?: string }).publishedAt).localeCompare(String((a as { publishedAt?: string }).publishedAt)));
}

async function getHomepageCollections(plan: { ids: string[]; latestLimit?: number }): Promise<PublicCollectionSummary[]> {
  const base = publicFilter();
  const ids = validIds(plan.ids);
  if (!ids.length && plan.latestLimit === 0) return [];
  const match = ids.length ? { ...base, _id: { $in: ids } } : base;
  const pipeline = [
    { $match: match },
    { $sort: { publishedAt: -1 as const } },
    ...(ids.length || plan.latestLimit === undefined ? [] : [{ $limit: plan.latestLimit }]),
    { $lookup: { from: MediaAsset.collection.name, localField: "coverImage", foreignField: "_id", pipeline: [{ $project: { objectKey: 1, sourceUrl: 1, altText: 1, caption: 1, width: 1, height: 1, variants: 1 } }], as: "coverImage" } },
    { $unwind: { path: "$coverImage", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: Author.collection.name, localField: "curator", foreignField: "_id", pipeline: [{ $project: { name: 1, slug: 1, bio: 1 } }], as: "curator" } },
    { $unwind: { path: "$curator", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 1, title: 1, slug: 1, description: 1, coverImage: 1, curator: 1, publishedAt: 1, updatedAt: 1, seo: 1, itemCount: { $size: { $ifNull: ["$items", []] } } } },
  ];
  const values = await Collection.aggregate(pipeline).exec() as unknown as (CollectionRow & { itemCount?: number })[];
  return values.map((item) => ({ id: idOf(item), title: item.title, slug: item.slug, description: item.description, coverImage: collectionMedia(item.coverImage), curator: item.curator ? author(item.curator) : undefined, itemCount: item.itemCount ?? 0, publishedAt: dateOf(item.publishedAt), updatedAt: dateOf(item.updatedAt), seo: item.seo }));
}
async function categoryIdForSlug(slug?: string) { if (!slug) return undefined; const value = await Category.findOne({ slug }).select("_id").lean().exec(); return value?._id; }
const getPublishedCategoriesCached = unstable_cache(async (type: PublicContentType) => { await connectToDatabase(); const ids = await contentModels[type].distinct("category", publicFilter()); const values = await Category.find({ _id: { $in: ids } }).select("name slug description").sort({ name: 1 }).lean().exec(); return values.map(category); }, ["public-categories"], { revalidate: PUBLIC_LIST_REVALIDATE, tags: ["public-categories"] });
export function getPublishedCategories(type: PublicContentType) { return getPublishedCategoriesCached(type); }

const getPublishedArticlesCached = unstable_cache(async (limit: number | null, categorySlug: string | null, homepage: boolean) => { await connectToDatabase(); const categoryId = await categoryIdForSlug(categorySlug ?? undefined); if (categorySlug && !categoryId) return []; const q = Article.find({ ...publicFilter(), ...(categoryId ? { category: categoryId } : {}) }).sort({ publishedAt: -1 }); if (homepage) q.select(homepageArticleSelect); if (limit) q.limit(limit); return (await q.populate(homepage ? homepageArticlePopulate : articlePopulate).lean().exec()).map(articleDto); }, ["public-articles"], { revalidate: PUBLIC_LIST_REVALIDATE, tags: ["public-articles"] });
export function getPublishedArticles(limit?: number, options?: PublicQueryOptions) { return getPublishedArticlesCached(limit ?? null, options?.category ?? null, Boolean(options?.homepage)); }

const getPublishedVideosCached = unstable_cache(async (limit: number | null, categorySlug: string | null, homepage: boolean) => { await connectToDatabase(); const categoryId = await categoryIdForSlug(categorySlug ?? undefined); if (categorySlug && !categoryId) return []; const q = Video.find({ ...publicFilter(), ...(categoryId ? { category: categoryId } : {}) }).sort({ publishedAt: -1 }); if (homepage) q.select(homepageVideoSelect); if (limit) q.limit(limit); return (await q.populate(homepage ? homepageVideoPopulate : videoPopulate).lean().exec()).map(videoDto); }, ["public-videos"], { revalidate: PUBLIC_LIST_REVALIDATE, tags: ["public-videos"] });
export function getPublishedVideos(limit?: number, options?: PublicQueryOptions) { return getPublishedVideosCached(limit ?? null, options?.category ?? null, Boolean(options?.homepage)); }

const getPublishedResearchCached = unstable_cache(async (limit: number | null, categorySlug: string | null, homepage: boolean) => { await connectToDatabase(); const categoryId = await categoryIdForSlug(categorySlug ?? undefined); if (categorySlug && !categoryId) return []; const q = Research.find({ ...publicFilter(), ...(categoryId ? { category: categoryId } : {}) }).sort({ publishedAt: -1 }); if (homepage) q.select(homepageResearchSelect); if (limit) q.limit(limit); return (await q.populate(homepage ? homepageResearchPopulate : researchPopulate).lean().exec()).map(researchDto); }, ["public-research"], { revalidate: PUBLIC_LIST_REVALIDATE, tags: ["public-research"] });
export function getPublishedResearch(limit?: number, options?: PublicQueryOptions) { return getPublishedResearchCached(limit ?? null, options?.category ?? null, Boolean(options?.homepage)); }

const getPublishedArticleBySlugCached = (slug: string) => unstable_cache(async () => { await connectToDatabase(); const value = await Article.findOne({ ...publicFilter(), slug }).populate(articlePopulate).lean().exec(); return value ? articleDto(value) : null; }, ["public-article-detail", slug], { revalidate: PUBLIC_DETAIL_REVALIDATE, tags: ["public-articles", `public-article:${slug}`] })();
export const getPublishedArticleBySlug = cache((slug: string) => getPublishedArticleBySlugCached(normalizeSlug(slug)));
const getPublishedVideoBySlugCached = (slug: string) => unstable_cache(async () => { await connectToDatabase(); const value = await Video.findOne({ ...publicFilter(), slug }).populate(videoPopulate).lean().exec(); return value ? videoDto(value) : null; }, ["public-video-detail", slug], { revalidate: PUBLIC_DETAIL_REVALIDATE, tags: ["public-videos", `public-video:${slug}`] })();
export const getPublishedVideoBySlug = cache((slug: string) => getPublishedVideoBySlugCached(normalizeSlug(slug)));
const getPublishedResearchBySlugCached = (slug: string) => unstable_cache(async () => { await connectToDatabase(); const value = await Research.findOne({ ...publicFilter(), slug }).populate(researchPopulate).lean().exec(); return value ? researchDto(value) : null; }, ["public-research-detail", slug], { revalidate: PUBLIC_DETAIL_REVALIDATE, tags: ["public-research", `public-research:${slug}`] })();
export const getPublishedResearchBySlug = cache((slug: string) => getPublishedResearchBySlugCached(normalizeSlug(slug)));

const getRelatedPublishedArticlesCached = unstable_cache(async (articleId: string, categoryId: string, limit: number) => { await connectToDatabase(); const related = await Article.find({ ...publicFilter(), _id: { $ne: articleId }, category: categoryId }).sort({ publishedAt: -1 }).limit(limit).populate(articlePopulate).lean().exec(); if (related.length >= limit) return related.map(articleDto); const excludedIds = [articleId, ...related.map((item) => idOf(item))]; const fallback = await Article.find({ ...publicFilter(), _id: { $nin: excludedIds }, category: { $ne: categoryId } }).sort({ publishedAt: -1 }).limit(limit - related.length).populate(articlePopulate).lean().exec(); return [...related, ...fallback].map(articleDto); }, ["public-related-articles"], { revalidate: PUBLIC_DETAIL_REVALIDATE, tags: ["public-articles"] });
export function getRelatedPublishedArticles(articleId: string, categoryId: string, limit = 3) { return getRelatedPublishedArticlesCached(articleId, categoryId, limit); }
type CollectionRow = { _id: unknown; title: string; slug: string; description: string; coverImage?: unknown; curator?: unknown; items: { type: "article" | "research" | "video"; contentId: unknown; order: number }[]; itemCount?: number; publishedAt: Date; updatedAt: Date; seo?: { metaTitle?: string; metaDescription?: string } };
const collectionMedia = (value: unknown) => value ? media(value) : undefined;
async function collectionItems(items: CollectionRow["items"]): Promise<PublicCollectionItem[]> {
  const ids = { article: items.filter((item) => item.type === "article").map((item) => item.contentId), research: items.filter((item) => item.type === "research").map((item) => item.contentId), video: items.filter((item) => item.type === "video").map((item) => item.contentId) };
  const [articles, research, videos] = await Promise.all([
    Article.find({ ...publicFilter(), _id: { $in: ids.article } }).populate(articlePopulate).lean(),
    Research.find({ ...publicFilter(), _id: { $in: ids.research } }).populate(researchPopulate).lean(),
    Video.find({ ...publicFilter(), _id: { $in: ids.video } }).populate(videoPopulate).lean(),
  ]);
  const lookup = new Map<string, PublicCollectionItem>();
  for (const item of articles) { const value = articleDto(item); lookup.set(`article:${value.id}`, { type: "article", title: value.title, slug: value.slug, description: value.excerpt, image: value.featuredImage, author: value.author.name, publishedAt: value.publishedAt, order: 0 }); }
  for (const item of research) { const value = researchDto(item); lookup.set(`research:${value.id}`, { type: "research", title: value.title, slug: value.slug, description: value.description, image: value.coverImage, author: value.authors.map((authorItem) => authorItem.name).join(" · ") || "Jyot Research", publishedAt: value.publishedAt, order: 0 }); }
  for (const item of videos) { const value = videoDto(item); lookup.set(`video:${value.id}`, { type: "video", title: value.title, slug: value.slug, description: value.description, image: value.thumbnail, author: value.author?.name ?? "Jyot", publishedAt: value.publishedAt, order: 0 }); }
  return items.map((item) => { const value = lookup.get(`${item.type}:${String(item.contentId)}`); return value ? { ...value, order: item.order } : null; }).filter((item): item is PublicCollectionItem => Boolean(item)).sort((a, b) => a.order - b.order);
}
const collectionDto = async (value: unknown): Promise<PublicCollection> => { const item = value as CollectionRow; return { id: idOf(item), title: item.title, slug: item.slug, description: item.description, coverImage: collectionMedia(item.coverImage), curator: item.curator ? author(item.curator) : undefined, items: await collectionItems(item.items ?? []), publishedAt: dateOf(item.publishedAt), updatedAt: dateOf(item.updatedAt), seo: item.seo }; };
const getPublishedCollectionsCached = unstable_cache(async (limit: number | null): Promise<PublicCollectionSummary[]> => { await connectToDatabase(); return getHomepageCollections({ ids: [], latestLimit: limit ?? undefined }); }, ["public-collections"], { revalidate: PUBLIC_LIST_REVALIDATE, tags: ["public-collections"] });
export function getPublishedCollections(limit?: number) { return getPublishedCollectionsCached(limit ?? null); }
const getPublishedCollectionBySlugCached = (slug: string) => unstable_cache(async () => { await connectToDatabase(); const value = await Collection.findOne({ ...publicFilter(), slug }).populate("coverImage").populate("curator", "name slug bio").select("title slug description coverImage curator items publishedAt updatedAt seo").lean(); return value ? collectionDto(value) : null; }, ["public-collection-detail", slug], { revalidate: PUBLIC_DETAIL_REVALIDATE, tags: ["public-collections", `public-collection:${slug}`] })();
export const getPublishedCollectionBySlug = cache((slug: string) => getPublishedCollectionBySlugCached(normalizeSlug(slug)));
export async function getCollectionPreviewById(id: string) { await connectToDatabase(); const value = await Collection.findById(id).populate("coverImage").populate("curator", "name slug bio").select("title slug description coverImage curator items publishedAt updatedAt seo status").lean(); return value ? collectionDto(value) : null; }
const getCollectionNavigationCached = unstable_cache(async (type: "article" | "research" | "video", contentId: string) => { await connectToDatabase(); const Model = type === "article" ? Article : type === "research" ? Research : Video; const current = await Model.findOne({ ...publicFilter(), _id: contentId }).select("slug").lean() as unknown as { slug?: string } | null; const rows = await Collection.find({ ...publicFilter(), "items.type": type, "items.contentId": contentId }).select("title slug items").lean(); const matches: { collection: { title: string; slug: string }; index: number; total: number; previous?: PublicCollectionItem; next?: PublicCollectionItem }[] = []; for (const row of rows as unknown as CollectionRow[]) { const items = await collectionItems(row.items); const index = current?.slug ? items.findIndex((item) => item.type === type && item.slug === current.slug) : -1; if (index >= 0) matches.push({ collection: { title: row.title, slug: row.slug }, index, total: items.length, previous: items[index - 1], next: items[index + 1] }); } return matches; }, ["public-collection-navigation"], { revalidate: PUBLIC_DETAIL_REVALIDATE, tags: ["public-collections", "public-articles", "public-videos", "public-research"] });
export function getCollectionNavigation(type: "article" | "research" | "video", contentId: string) { return getCollectionNavigationCached(type, contentId); }
export async function getPublishedHomepageConfig() { await connectToDatabase(); return HomepageConfig.findOne({ key: "homepage" }).select({ published: 1, publishedAt: 1 }).lean().exec(); }
export async function getHomepageConfigForPreview() { await connectToDatabase(); return HomepageConfig.findOne({ key: "homepage" }).select({ draft: 1, draftRevision: 1, updatedAt: 1 }).lean().exec(); }

async function getHomepageDataUncached(): Promise<PublicHomepageData> {
  const config = await getPublishedHomepageConfig();
  const published = (config as unknown as { published?: { sections?: PublicSection[] } } | null)?.published;
  const sections = (published?.sections ?? []).filter((section) => section.enabled).sort((a, b) => a.order - b.order);
  const plan = homepagePlan(sections);
  const [articles, videos, research, collections, articleCategories] = await Promise.all([
    getHomepageContent(Article, homepageArticleSelect, homepageArticlePopulate, plan.articles, articleDto),
    getHomepageContent(Video, homepageVideoSelect, homepageVideoPopulate, plan.videos, videoDto),
    getHomepageContent(Research, homepageResearchSelect, homepageResearchPopulate, plan.research, researchDto),
    getHomepageCollections(plan.collections),
    getPublishedCategories("articles"),
  ]);
  return { config: { sections }, articles, videos, research, collections, articleCategories };
}
export const getHomepageData = unstable_cache(getHomepageDataUncached, ["public-homepage"], { revalidate: PUBLIC_HOMEPAGE_REVALIDATE, tags: ["public-homepage", "public-articles", "public-videos", "public-research", "public-collections", "public-categories"] });
export async function getHomepagePreviewData(): Promise<PublicHomepageData> { const config = await getHomepageConfigForPreview(); const [articles, videos, research, collections, articleCategories] = await Promise.all([getPublishedArticles(), getPublishedVideos(), getPublishedResearch(), getPublishedCollections(), getPublishedCategories("articles")]); const draft = (config as unknown as { draft?: { sections?: PublicSection[] } } | null)?.draft; const sections = (draft?.sections ?? []).filter((section) => section.enabled).sort((a, b) => a.order - b.order); return { config: { sections }, articles, videos, research, collections, articleCategories }; }
