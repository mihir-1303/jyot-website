/* eslint-disable @typescript-eslint/no-explicit-any */
import { loadEnvConfig } from "@next/env";
import { connectToDatabase } from "../lib/db/mongodb-core";
import { Article, Author, Category, Collection, HomepageConfig, MediaAsset, Research, Tag, User, Video } from "../lib/db/models-core";
import { articles, homepageData, mediaAssets, research, videos } from "../lib/mockData";
import mongoose from "mongoose";

loadEnvConfig(process.cwd());

const oid = () => new mongoose.Types.ObjectId();

async function seed() {
  await connectToDatabase();
  const user = await User.findOneAndUpdate({ email: "seed@jyot.local" }, { name: "Jyot Seed User", email: "seed@jyot.local", role: "ADMIN" }, { upsert: true, new: true });
  const mediaIds = new Map(mediaAssets.map((item) => [item.id, oid()]));
  const authorRows = new Map<string, { id: string; name: string; slug: string }>();
  const categoryRows = new Map<string, { id: string; name: string; slug: string }>();
  const tagRows = new Map<string, { id: string; name: string; slug: string }>();
  for (const item of [...articles, ...videos, ...research] as any[]) {
    if (item.author) authorRows.set(item.author.id, item.author);
    categoryRows.set(item.category.id, item.category);
    for (const author of item.authors ?? []) authorRows.set(author.id, author);
    for (const tag of item.tags ?? []) tagRows.set(tag, { id: tag, name: tag, slug: tag });
  }
  const authorIds = new Map([...authorRows.keys()].map((id) => [id, oid()]));
  const categoryIds = new Map([...categoryRows.keys()].map((id) => [id, oid()]));
  const tagIds = new Map([...tagRows.keys()].map((id) => [id, oid()]));
  const audit = { createdBy: user!._id, updatedBy: user!._id };
  await MediaAsset.bulkWrite(mediaAssets.map((item) => ({ updateOne: { filter: { objectKey: `seed/${item.id}.jpg` }, update: { $set: { ...audit, originalName: item.originalName, objectKey: `seed/${item.id}.jpg`, sourceUrl: item.url, mimeType: item.mimeType, size: item.size, width: item.width, height: item.height, altText: item.altText, variants: { original: { objectKey: `seed/${item.id}.jpg`, width: item.width, height: item.height, mimeType: item.mimeType } } }, $setOnInsert: { _id: mediaIds.get(item.id) } }, upsert: true } })));
  const storedMedia = await MediaAsset.find({ objectKey: { $in: mediaAssets.map((item) => `seed/${item.id}.jpg`) } }).select("_id objectKey").lean();
  for (const item of storedMedia as any[]) mediaIds.set(String(item.objectKey).replace(/^seed\//, "").replace(/\.jpg$/, ""), item._id);
  await Author.bulkWrite([...authorRows.values()].map((item) => ({ updateOne: { filter: { slug: item.slug }, update: { $set: { ...audit, name: item.name, slug: item.slug, legacyId: item.id }, $setOnInsert: { _id: authorIds.get(item.id) } }, upsert: true } })));
  const storedAuthors = await Author.find({ slug: { $in: [...authorRows.values()].map((item) => item.slug) } }).select("_id legacyId").lean();
  for (const item of storedAuthors as any[]) if (item.legacyId) authorIds.set(item.legacyId, item._id);
  await Category.bulkWrite([...categoryRows.values()].map((item) => ({ updateOne: { filter: { slug: item.slug }, update: { $set: { ...audit, name: item.name, slug: item.slug, legacyId: item.id }, $setOnInsert: { _id: categoryIds.get(item.id) } }, upsert: true } })));
  const storedCategories = await Category.find({ slug: { $in: [...categoryRows.values()].map((item) => item.slug) } }).select("_id legacyId").lean();
  for (const item of storedCategories as any[]) if (item.legacyId) categoryIds.set(item.legacyId, item._id);
  await Tag.bulkWrite([...tagRows.values()].map((item) => ({ updateOne: { filter: { slug: item.slug }, update: { $set: { ...audit, name: item.name, slug: item.slug, legacyId: item.id }, $setOnInsert: { _id: tagIds.get(item.id) } }, upsert: true } })));
  const storedTags = await Tag.find({ slug: { $in: [...tagRows.values()].map((item) => item.slug) } }).select("_id legacyId").lean();
  for (const item of storedTags as any[]) if (item.legacyId) tagIds.set(item.legacyId, item._id);
  const articleDocs = articles.map((item) => ({ ...item, _id: oid(), legacyId: item.id, coverMedia: mediaIds.get(item.featuredImage.id), author: authorIds.get(item.author.id), category: categoryIds.get(item.category.id), tags: item.tags.map((tag) => tagIds.get(tag)), ...audit, content: item.content || "" }));
  const videoDocs = videos.map((item) => ({ ...item, _id: oid(), legacyId: item.id, thumbnail: mediaIds.get(item.thumbnail.id), author: item.author ? authorIds.get(item.author.id) : undefined, category: categoryIds.get(item.category.id), sourceType: "external", externalUrl: item.videoUrl || undefined, provider: item.provider, ...audit }));
  const researchDocs = research.map((item) => ({ ...item, _id: oid(), legacyId: item.id, coverMedia: mediaIds.get(item.coverImage.id), authors: item.authors.map((a) => authorIds.get(a.id)), category: categoryIds.get(item.category.id), ...audit, content: "" }));
  await Article.bulkWrite(articleDocs.map((item) => { const { _id, ...fields } = item; return { updateOne: { filter: { slug: item.slug }, update: { $set: fields, $setOnInsert: { _id } }, upsert: true } }; }));
  await Video.bulkWrite(videoDocs.map((item) => { const { _id, ...fields } = item; return { updateOne: { filter: { slug: item.slug }, update: { $set: fields, $setOnInsert: { _id } }, upsert: true } }; }));
  await Research.bulkWrite(researchDocs.map((item) => { const { _id, ...fields } = item; return { updateOne: { filter: { slug: item.slug }, update: { $set: fields, $setOnInsert: { _id } }, upsert: true } }; }));
  const storedArticles = await Article.find({ slug: { $in: articles.map((item) => item.slug) } }).select("_id slug legacyId").lean();
  const storedVideos = await Video.find({ slug: { $in: videos.map((item) => item.slug) } }).select("_id slug legacyId").lean();
  const storedResearch = await Research.find({ slug: { $in: research.map((item) => item.slug) } }).select("_id slug legacyId").lean();
  const storedByLegacyId = new Map([...storedArticles, ...storedVideos, ...storedResearch].map((item: any) => [String(item.legacyId), item._id]));
  await Collection.findOneAndUpdate({ slug: "jyot-changing-futures" }, { $set: { ...audit, title: "Jyot: Changing Futures", slug: "jyot-changing-futures", description: "A curated introduction to Jyot's ideas, people and perspectives on a changing world.", status: "published", publishedAt: new Date("2026-09-01T00:00:00.000Z"), coverImage: mediaIds.get("photo-1532664189809-02133fee698d"), curator: authorIds.get("jyot-research-desk"), items: [{ type: "article", contentId: storedByLegacyId.get("future-cities"), order: 1 }, { type: "video", contentId: storedByLegacyId.get("india-multipolar-world"), order: 2 }, { type: "research", contentId: storedByLegacyId.get("order"), order: 3 }] }, $setOnInsert: { createdBy: user!._id } }, { upsert: true, new: true, runValidators: true });
  const sections = (homepageData.config.sections as any[]).map((section) => ({ ...section, content: section.content?.mode === "manual" ? { ...section.content, ids: section.content.ids.map((id: string) => storedByLegacyId.get(id)).filter(Boolean) } : section.content }));
  const snapshot = { sections, revision: 1, updatedAt: new Date() };
  await HomepageConfig.findOneAndUpdate({ key: "homepage" }, { key: "homepage", draft: snapshot, published: snapshot, draftRevision: 1, publishedRevision: 1, ...audit, draftUpdatedBy: user!._id, publishedBy: user!._id, publishedAt: new Date() }, { upsert: true });
  console.log("Jyot seed complete");
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });
