"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { connectToDatabase } from "../db/mongodb";
import { Article, Collection, HomepageConfig, Research, Video } from "../db/models";
import { requirePermission } from "../permissions";
import { homepageSectionSchema, homepageSnapshotSchema } from "../validations/domain";
import { z } from "zod";

const inputSchema = z.object({ revision: z.number().int().nonnegative(), sections: z.array(homepageSectionSchema) });
const publicFilter = (ids: string[]) => ({ _id: { $in: ids }, status: "published", $or: [{ publishedAt: { $exists: false } }, { publishedAt: { $lte: new Date() } }] });
async function validateReferences(sections: z.infer<typeof homepageSnapshotSchema>["sections"]) {
  const articleIds = sections.filter((section) => ["hero", "featured", "articles", "topic"].includes(section.type)).flatMap((section) => section.content.mode === "manual" ? section.content.ids : []);
  const videoIds = sections.filter((section) => section.type === "videos").flatMap((section) => section.content.mode === "manual" ? section.content.ids : []);
  const researchIds = sections.filter((section) => ["research", "research-explorer"].includes(section.type)).flatMap((section) => section.content.mode === "manual" ? section.content.ids : []);
  const collectionIds = sections.filter((section) => section.type === "collection").flatMap((section) => section.content.mode === "manual" ? section.content.ids : []);
  const [articles, videos, research, collections] = await Promise.all([Article.countDocuments(publicFilter(articleIds)), Video.countDocuments(publicFilter(videoIds)), Research.countDocuments(publicFilter(researchIds)), Collection.countDocuments(publicFilter(collectionIds))]);
  if (articles !== new Set(articleIds).size || videos !== new Set(videoIds).size || research !== new Set(researchIds).size || collections !== new Set(collectionIds).size) throw new Error("Homepage contains unpublished or missing manual content references.");
}
function parseConfiguration(formData: FormData) { return inputSchema.parse(JSON.parse(String(formData.get("configuration")))); }

export async function saveHomepageDraft(formData: FormData) {
  const user = await requirePermission("homepage.edit"); const parsed = parseConfiguration(formData); await connectToDatabase();
  const config = await HomepageConfig.findOneAndUpdate({ key: "homepage", draftRevision: parsed.revision }, { $set: { draft: { sections: parsed.sections, revision: parsed.revision + 1, updatedAt: new Date() }, draftUpdatedBy: user.id, updatedBy: user.id }, $inc: { draftRevision: 1 } }, { new: true }).lean();
  if (!config) throw new Error("Draft changed by another editor. Reload before saving."); revalidatePath("/admin/homepage"); revalidatePath("/admin/homepage/preview");
}

export async function discardHomepageDraft() {
  const user = await requirePermission("homepage.edit"); await connectToDatabase(); const current = await HomepageConfig.findOne({ key: "homepage" }).lean() as unknown as { published: z.infer<typeof homepageSnapshotSchema>; draftRevision: number } | null; if (!current) throw new Error("Homepage configuration is not initialized.");
  await HomepageConfig.updateOne({ key: "homepage" }, { $set: { draft: current.published, draftUpdatedBy: user.id, updatedBy: user.id }, $inc: { draftRevision: 1 } }); revalidatePath("/admin/homepage"); revalidatePath("/admin/homepage/preview");
}

export async function publishHomepage(formData: FormData) {
  const user = await requirePermission("homepage.publish"); const expectedRevision = z.coerce.number().int().nonnegative().parse(formData.get("revision")); await connectToDatabase();
  const current = await HomepageConfig.findOne({ key: "homepage", draftRevision: expectedRevision }).lean() as unknown as { draft: z.infer<typeof homepageSnapshotSchema>; published: z.infer<typeof homepageSnapshotSchema>; publishedRevision: number } | null; if (!current) throw new Error("Draft changed by another editor. Reload and try again.");
  const draft = homepageSnapshotSchema.parse(current.draft); await validateReferences(draft.sections); const nextRevision = (current.publishedRevision ?? 0) + 1; const snapshot = { ...draft, revision: nextRevision, updatedAt: new Date() };
  const now = new Date(); const history = [{ revision: current.published.revision, snapshot: current.published, createdAt: now, publishedAt: current.publishedRevision === 0 ? now : undefined }, { revision: nextRevision, snapshot, createdBy: user.id, createdAt: now, publishedAt: now }];
  const published = await HomepageConfig.findOneAndUpdate({ key: "homepage", draftRevision: expectedRevision }, { $set: { published: snapshot, publishedBy: user.id, publishedAt: now, updatedBy: user.id }, $push: { revisions: { $each: history } }, $inc: { publishedRevision: 1 } }, { new: true }).lean();
  if (!published) throw new Error("Draft changed before publishing. Reload and try again."); revalidateTag("public-homepage", "max"); revalidatePath("/"); revalidatePath("/articles"); revalidatePath("/videos"); revalidatePath("/research"); revalidatePath("/admin/homepage"); revalidatePath("/admin/homepage/preview");
}

export async function restoreHomepageRevision(formData: FormData) {
  const user = await requirePermission("homepage.publish"); const revision = z.coerce.number().int().positive().parse(formData.get("revision")); await connectToDatabase();
  const current = await HomepageConfig.findOne({ key: "homepage" }).lean() as unknown as { revisions?: { revision: number; snapshot: z.infer<typeof homepageSnapshotSchema> }[]; draftRevision: number } | null; const selected = current?.revisions?.find((item) => item.revision === revision); if (!current || !selected) throw new Error("That homepage revision is no longer available.");
  await validateReferences(selected.snapshot.sections); await HomepageConfig.updateOne({ key: "homepage" }, { $set: { draft: { ...selected.snapshot, revision: current.draftRevision + 1, updatedAt: new Date() }, draftUpdatedBy: user.id, updatedBy: user.id }, $inc: { draftRevision: 1 } }); revalidatePath("/admin/homepage"); revalidatePath("/admin/homepage/preview");
}
