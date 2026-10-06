import { z } from "zod";
import { featuredReferenceKey } from "../featured";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");
export const roleSchema = z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER", "CONTRIBUTOR"]);
export const contentStatusSchema = z.enum(["draft", "review", "scheduled", "published", "archived"]);
export const seoSchema = z.object({ metaTitle: z.string().max(70).optional(), metaDescription: z.string().max(160).optional(), ogImage: objectIdSchema.optional() }).strict();
export const sectionSettingsSchema = z.object({ label: z.string().max(120).optional(), heading: z.string().max(180).optional(), description: z.string().max(500).optional(), ctaLabel: z.string().max(80).optional(), ctaHref: z.string().max(500).optional() }).strict();
export const manualContentSchema = z.object({ mode: z.literal("manual"), ids: z.array(objectIdSchema).min(1), categoryId: objectIdSchema.optional() }).strict();
const featuredIdSchema = z.union([objectIdSchema, z.string().regex(/^(article|research|video):[a-f\d]{24}$/i, "Invalid Featured content reference")]);
const featuredReferenceSchema = z.object({ type: z.enum(["article", "research", "video"]), id: z.coerce.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId") }).strict();
const featuredContentSchema = z.object({ mode: z.literal("manual"), ids: z.array(featuredIdSchema), categoryId: objectIdSchema.optional() }).strict().superRefine((content, ctx) => {
  const keys = content.ids.map((id) => id.includes(":") ? id : `article:${id}`);
  if (new Set(keys).size !== keys.length) ctx.addIssue({ code: "custom", message: "Featured content IDs must be unique." });
});
export const latestContentSchema = z.object({ mode: z.literal("latest"), limit: z.number().int().min(1).max(12), categoryId: objectIdSchema.optional(), tagIds: z.array(objectIdSchema).optional() }).strict();
const researchExplorerTopicSelectionSchema = z.object({ categoryId: z.union([z.literal("all"), objectIdSchema]), ids: z.array(objectIdSchema).min(1).max(100) }).strict();
export const researchExplorerContentSchema = z.object({ mode: z.literal("manual"), ids: z.array(objectIdSchema).min(1).max(200), topicSelections: z.array(researchExplorerTopicSelectionSchema).min(1).max(100).optional() }).strict();
export const sectionContentSchema = z.discriminatedUnion("mode", [manualContentSchema, latestContentSchema]);
const baseSection = { id: z.string().min(1).max(80), title: z.string().min(1).max(120), enabled: z.boolean(), order: z.number().int().min(0), settings: sectionSettingsSchema.optional() };
export const homepageSectionSchema = z.discriminatedUnion("type", [
  z.object({ ...baseSection, type: z.literal("hero"), content: manualContentSchema }),
  z.object({ ...baseSection, type: z.literal("featured"), content: featuredContentSchema }),
  z.object({ ...baseSection, type: z.literal("articles"), content: sectionContentSchema }),
  z.object({ ...baseSection, type: z.literal("videos"), content: sectionContentSchema }),
  z.object({ ...baseSection, type: z.literal("research"), content: sectionContentSchema }),
  z.object({ ...baseSection, type: z.literal("research-explorer"), content: z.union([researchExplorerContentSchema, latestContentSchema]) }),
  z.object({ ...baseSection, type: z.literal("topic"), content: sectionContentSchema }),
  z.object({ ...baseSection, type: z.literal("collection"), content: manualContentSchema }),
]);
export const homepageSnapshotSchema = z.object({ sections: z.array(homepageSectionSchema).max(20), featured: z.array(featuredReferenceSchema).default([]), revision: z.number().int().nonnegative(), updatedAt: z.coerce.date() }).superRefine((snapshot, ctx) => { const ids = snapshot.sections.map((section) => section.id); const orders = snapshot.sections.map((section) => section.order); if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Homepage section IDs must be unique." }); if (new Set(orders).size !== orders.length) ctx.addIssue({ code: "custom", message: "Homepage section orders must be unique." }); if (new Set(snapshot.featured.map(featuredReferenceKey)).size !== snapshot.featured.length) ctx.addIssue({ code: "custom", message: "Featured content references must be unique." }); for (const section of snapshot.sections) { if (section.type === "hero" && section.content.ids.length !== 1) ctx.addIssue({ code: "custom", message: "Hero must select exactly one item." }); } });
export const homepageConfigSchema = z.object({ key: z.literal("homepage"), draft: homepageSnapshotSchema, published: homepageSnapshotSchema, draftUpdatedBy: objectIdSchema, publishedBy: objectIdSchema.optional(), publishedAt: z.coerce.date().optional(), updatedAt: z.coerce.date() });
export const mediaAssetInputSchema = z.object({ originalName: z.string().min(1).max(255), mimeType: z.string().min(1), size: z.number().int().positive(), width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), altText: z.string().max(300), caption: z.string().max(500).optional(), focalPoint: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional() }).strict();
