"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { connectToDatabase } from "../db/mongodb";
import { Article, Collection, HomepageConfig, Research, Video } from "../db/models";
import { requirePermission } from "../permissions";
import { homepageSectionSchema, homepageSnapshotSchema, objectIdSchema } from "../validations/domain";
import { z } from "zod";
import { featuredReferencesFromSections } from "../featured";

const inputSchema = z.object({ revision: z.number().int().nonnegative(), sections: z.array(homepageSectionSchema) });
const publicFilter = (ids: string[]) => ({ _id: { $in: ids }, status: "published", $or: [{ publishedAt: { $exists: false } }, { publishedAt: { $lte: new Date() } }] });
export async function validateReferences(sections: z.infer<typeof homepageSnapshotSchema>["sections"]) {
  const idsFor = (section: z.infer<typeof homepageSectionSchema>, fallback: "article" | "research" | "video") => section.content.mode === "manual" ? section.content.ids.map((value) => { const [type, id] = value.split(":"); return { type: (id && ["article", "research", "video"].includes(type) ? type : fallback) as "article" | "research" | "video", id: id ?? value }; }) : [];
  const references = sections.flatMap((section) => section.type === "hero" || section.type === "featured" || section.type === "articles" || section.type === "topic" ? idsFor(section, "article") : section.type === "videos" ? idsFor(section, "video") : section.type === "research" || section.type === "research-explorer" ? idsFor(section, "research") : []);
  const articleIds = references.filter((reference) => reference.type === "article").map((reference) => reference.id);
  const videoIds = references.filter((reference) => reference.type === "video").map((reference) => reference.id);
  const researchIds = references.filter((reference) => reference.type === "research").map((reference) => reference.id);
  const collectionIds = sections.filter((section) => section.type === "collection").flatMap((section) => section.content.mode === "manual" ? section.content.ids : []);
  const [articles, videos, research, collections] = await Promise.all([Article.countDocuments(publicFilter(articleIds)), Video.countDocuments(publicFilter(videoIds)), Research.countDocuments(publicFilter(researchIds)), Collection.countDocuments(publicFilter(collectionIds))]);
  if (articles !== new Set(articleIds).size || videos !== new Set(videoIds).size || research !== new Set(researchIds).size || collections !== new Set(collectionIds).size) throw new Error("Homepage contains unpublished or missing manual content references.");
}
function parseConfiguration(formData: FormData) { return inputSchema.parse(JSON.parse(String(formData.get("configuration")))); }

export type FeaturedArticlesResult = { ok: boolean; message: string };

function parseSelectedArticleIds(formData: FormData) {
  const rawIds = String(formData.get("articleIds") ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  try { return { ids: [...new Set(rawIds.map((id) => objectIdSchema.parse(id)))], error: "" }; } catch { return { ids: [], error: "One or more selected article IDs are invalid." }; }
}

export async function pushArticlesToFeatured(formData: FormData): Promise<FeaturedArticlesResult> {
  const user = await requirePermission("homepage.edit");
  const parsedIds = parseSelectedArticleIds(formData);
  if (parsedIds.error) return { ok: false, message: parsedIds.error };
  const selectedIds = parsedIds.ids.map((id) => `article:${id}`);
  if (selectedIds.length === 0) return { ok: false, message: "Select at least one article." };
  await connectToDatabase();
  const current = await HomepageConfig.findOne({ key: "homepage" }).lean() as unknown as { draft: z.infer<typeof homepageSnapshotSchema>; draftRevision: number } | null;
  if (!current) return { ok: false, message: "Homepage configuration is not initialized." };
  const draft = homepageSnapshotSchema.safeParse(current.draft);
  if (!draft.success) return { ok: false, message: "The homepage draft is invalid. Fix it in Homepage before adding Featured articles." };
  const sectionIndex = draft.data.sections.findIndex((section) => section.type === "featured");
  const section = draft.data.sections.find((item) => item.type === "featured");
  if (sectionIndex < 0 || !section || section.content.mode !== "manual") return { ok: false, message: "No Featured section is configured on the homepage." };
  const existingIds = [...new Set(section.content.ids.map((id) => id.includes(":") ? id : `article:${id}`))];
  const additions = selectedIds.filter((id) => !existingIds.includes(id));
  if (additions.length === 0) return { ok: true, message: "All selected articles are already in Featured." };
  const articles = await Article.countDocuments(publicFilter(additions.map((id) => id.split(":")[1])));
  if (articles !== additions.length) return { ok: false, message: "Only published articles can be added to Featured. Review your selection and try again." };
  const addedIds = additions;
  const nextSections = draft.data.sections.map((item, index) => index === sectionIndex ? { ...item, content: { ...item.content, ids: [...existingIds, ...addedIds] } } : item);
  const nextDraft = homepageSnapshotSchema.parse({ ...draft.data, sections: nextSections, featured: featuredReferencesFromSections(nextSections), revision: current.draftRevision + 1, updatedAt: new Date() });
  const updated = await HomepageConfig.findOneAndUpdate({ key: "homepage", draftRevision: current.draftRevision }, { $set: { draft: nextDraft, draftUpdatedBy: user.id, updatedBy: user.id }, $inc: { draftRevision: 1 } }, { new: true }).lean();
  if (!updated) return { ok: false, message: "The homepage draft changed. Reload the Articles page and try again." };
  revalidatePath("/admin/articles"); revalidatePath("/admin/homepage");
  return { ok: true, message: `${addedIds.length} article${addedIds.length === 1 ? "" : "s"} added to Featured.` };
}

export async function removeArticlesFromFeatured(formData: FormData): Promise<FeaturedArticlesResult> {
  const user = await requirePermission("homepage.edit");
  const parsedIds = parseSelectedArticleIds(formData);
  if (parsedIds.error) return { ok: false, message: parsedIds.error };
  if (parsedIds.ids.length === 0) return { ok: false, message: "Select at least one article." };
  await connectToDatabase();
  const current = await HomepageConfig.findOne({ key: "homepage" }).lean() as unknown as { draft: z.infer<typeof homepageSnapshotSchema>; draftRevision: number } | null;
  if (!current) return { ok: false, message: "Homepage configuration is not initialized." };
  const draft = homepageSnapshotSchema.safeParse(current.draft);
  if (!draft.success) return { ok: false, message: "The homepage draft is invalid. Fix it in Homepage before removing Featured articles." };
  const sectionIndex = draft.data.sections.findIndex((section) => section.type === "featured");
  const section = draft.data.sections.find((item) => item.type === "featured");
  if (sectionIndex < 0 || !section || section.content.mode !== "manual") return { ok: false, message: "No Featured section is configured on the homepage." };
  const selected = new Set(parsedIds.ids.map((id) => `article:${id}`));
  const existingIds = [...new Set(section.content.ids.map((id) => id.includes(":") ? id : `article:${id}`))];
  const removedCount = existingIds.filter((id) => selected.has(id)).length;
  if (removedCount === 0) return { ok: true, message: "None of the selected articles are in Featured." };
  const nextIds = existingIds.filter((id) => !selected.has(id));
  const nextSections = draft.data.sections.map((item, index) => index === sectionIndex ? { ...item, content: { ...item.content, ids: nextIds } } : item);
  const nextDraft = homepageSnapshotSchema.parse({ ...draft.data, sections: nextSections, featured: featuredReferencesFromSections(nextSections), revision: current.draftRevision + 1, updatedAt: new Date() });
  const updated = await HomepageConfig.findOneAndUpdate({ key: "homepage", draftRevision: current.draftRevision }, { $set: { draft: nextDraft, draftUpdatedBy: user.id, updatedBy: user.id }, $inc: { draftRevision: 1 } }, { new: true }).lean();
  if (!updated) return { ok: false, message: "The homepage draft changed. Reload the Articles page and try again." };
  revalidatePath("/admin/articles"); revalidatePath("/admin/homepage");
  return { ok: true, message: `${removedCount} article${removedCount === 1 ? "" : "s"} removed from Featured.` };
}

export async function saveHomepageDraft(formData: FormData) {
  const user = await requirePermission("homepage.edit"); const parsed = parseConfiguration(formData); await connectToDatabase(); const featured = featuredReferencesFromSections(parsed.sections);
  const config = await HomepageConfig.findOneAndUpdate({ key: "homepage", draftRevision: parsed.revision }, { $set: { draft: { sections: parsed.sections, featured, revision: parsed.revision + 1, updatedAt: new Date() }, draftUpdatedBy: user.id, updatedBy: user.id }, $inc: { draftRevision: 1 } }, { new: true }).lean();
  if (!config) throw new Error("Draft changed by another editor. Reload before saving."); revalidatePath("/admin/homepage"); revalidatePath("/admin/homepage/preview");
}

export async function discardHomepageDraft() {
  const user = await requirePermission("homepage.edit"); await connectToDatabase(); const current = await HomepageConfig.findOne({ key: "homepage" }).lean() as unknown as { published: z.infer<typeof homepageSnapshotSchema>; draftRevision: number } | null; if (!current) throw new Error("Homepage configuration is not initialized.");
  await HomepageConfig.updateOne({ key: "homepage" }, { $set: { draft: current.published, draftUpdatedBy: user.id, updatedBy: user.id }, $inc: { draftRevision: 1 } }); revalidatePath("/admin/homepage"); revalidatePath("/admin/homepage/preview");
}

export async function publishHomepage(formData: FormData) {
  const user = await requirePermission("homepage.publish"); const expectedRevision = z.coerce.number().int().nonnegative().parse(formData.get("revision")); await connectToDatabase();
  const current = await HomepageConfig.findOne({ key: "homepage", draftRevision: expectedRevision }).lean() as unknown as { draft: z.infer<typeof homepageSnapshotSchema>; published: z.infer<typeof homepageSnapshotSchema>; publishedRevision: number } | null; if (!current) throw new Error("Draft changed by another editor. Reload and try again.");
  const draft = homepageSnapshotSchema.parse(current.draft); await validateReferences(draft.sections); const nextRevision = (current.publishedRevision ?? 0) + 1; const snapshot = { ...draft, featured: draft.featured.length ? draft.featured : featuredReferencesFromSections(draft.sections), revision: nextRevision, updatedAt: new Date() };
  const now = new Date(); const history = [{ revision: current.published.revision, snapshot: current.published, createdAt: now, publishedAt: current.publishedRevision === 0 ? now : undefined }, { revision: nextRevision, snapshot, createdBy: user.id, createdAt: now, publishedAt: now }];
  const published = await HomepageConfig.findOneAndUpdate({ key: "homepage", draftRevision: expectedRevision }, { $set: { published: snapshot, publishedBy: user.id, publishedAt: now, updatedBy: user.id }, $push: { revisions: { $each: history } }, $inc: { publishedRevision: 1 } }, { new: true }).lean();
  if (!published) throw new Error("Draft changed before publishing. Reload and try again."); revalidateTag("public-homepage", "max"); revalidatePath("/"); revalidatePath("/articles"); revalidatePath("/videos"); revalidatePath("/research"); revalidatePath("/admin/homepage"); revalidatePath("/admin/homepage/preview");
}

export async function restoreHomepageRevision(formData: FormData) {
  const user = await requirePermission("homepage.publish"); const revision = z.coerce.number().int().positive().parse(formData.get("revision")); await connectToDatabase();
  const current = await HomepageConfig.findOne({ key: "homepage" }).lean() as unknown as { revisions?: { revision: number; snapshot: z.infer<typeof homepageSnapshotSchema> }[]; draftRevision: number } | null; const selected = current?.revisions?.find((item) => item.revision === revision); if (!current || !selected) throw new Error("That homepage revision is no longer available.");
  await validateReferences(selected.snapshot.sections); await HomepageConfig.updateOne({ key: "homepage" }, { $set: { draft: { ...selected.snapshot, featured: selected.snapshot.featured?.length ? selected.snapshot.featured : featuredReferencesFromSections(selected.snapshot.sections), revision: current.draftRevision + 1, updatedAt: new Date() }, draftUpdatedBy: user.id, updatedBy: user.id }, $inc: { draftRevision: 1 } }); revalidatePath("/admin/homepage"); revalidatePath("/admin/homepage/preview");
}
