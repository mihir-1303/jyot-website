"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db/mongodb";
import { HomepageConfig, Research } from "../db/models";
import { requirePermission } from "../permissions";
import { homepageSectionSchema, homepageSnapshotSchema, objectIdSchema } from "../validations/domain";

export async function saveResearchExploreDraft(formData: FormData) {
  const user = await requirePermission("homepage.edit");
  const revision = Number(formData.get("revision"));
  const ids = [...new Set(String(formData.get("ids") ?? "").split(",").map((id) => id.trim()).filter(Boolean))].map((id) => objectIdSchema.parse(id));
  await connectToDatabase();
  const current = await HomepageConfig.findOne({ key: "homepage", draftRevision: revision }).lean() as unknown as { draft: unknown; draftRevision: number } | null;
  if (!current) throw new Error("Draft changed by another editor. Reload and try again.");
  const draft = homepageSnapshotSchema.parse(current.draft);
  const existing = draft.sections.find((item) => item.type === "research-explorer");
  const section = homepageSectionSchema.parse(existing ? { ...existing, content: { mode: "manual", ids } } : { id: "research-explorer", type: "research-explorer", title: "Explore research", enabled: true, order: draft.sections.length + 1, content: { mode: "manual", ids } });
  const count = await Research.countDocuments({ _id: { $in: ids }, status: "published", $or: [{ publishedAt: { $exists: false } }, { publishedAt: { $lte: new Date() } }] });
  if (count !== ids.length) throw new Error("Only published research can be added to Explore Research.");
  const sections = existing ? draft.sections.map((item) => item.id === section.id ? section : item) : [...draft.sections, section];
  const nextDraft = homepageSnapshotSchema.parse({ ...draft, sections, revision: revision + 1, updatedAt: new Date() });
  const updated = await HomepageConfig.findOneAndUpdate({ key: "homepage", draftRevision: revision }, { $set: { draft: nextDraft, draftUpdatedBy: user.id, updatedBy: user.id }, $inc: { draftRevision: 1 } }, { new: true }).lean();
  if (!updated) throw new Error("Draft changed before saving. Reload and try again.");
  revalidatePath("/admin/research/explore"); revalidatePath("/admin/homepage"); revalidatePath("/admin/homepage/preview"); revalidatePath("/");
}
