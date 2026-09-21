import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");
export const roleSchema = z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER", "CONTRIBUTOR"]);
export const contentStatusSchema = z.enum(["draft", "review", "scheduled", "published", "archived"]);
export const seoSchema = z.object({ metaTitle: z.string().max(70).optional(), metaDescription: z.string().max(160).optional(), ogImage: objectIdSchema.optional() }).strict();
export const sectionSettingsSchema = z.object({ label: z.string().max(120).optional(), heading: z.string().max(180).optional(), description: z.string().max(500).optional(), ctaLabel: z.string().max(80).optional(), ctaHref: z.string().max(500).optional() }).strict();
export const manualContentSchema = z.object({ mode: z.literal("manual"), ids: z.array(objectIdSchema).min(1) }).strict();
export const latestContentSchema = z.object({ mode: z.literal("latest"), limit: z.number().int().min(1).max(12), categoryId: objectIdSchema.optional(), tagIds: z.array(objectIdSchema).optional() }).strict();
export const sectionContentSchema = z.discriminatedUnion("mode", [manualContentSchema, latestContentSchema]);
const baseSection = { title: z.string().min(1).max(120), enabled: z.boolean(), order: z.number().int().min(0), settings: sectionSettingsSchema.optional() };
export const homepageSectionSchema = z.discriminatedUnion("type", [
  z.object({ ...baseSection, id: z.literal("hero"), type: z.literal("hero"), content: manualContentSchema }),
  z.object({ ...baseSection, id: z.literal("featured"), type: z.literal("featured"), content: manualContentSchema }),
  z.object({ ...baseSection, id: z.literal("latest-insights"), type: z.literal("articles"), content: sectionContentSchema }),
  z.object({ ...baseSection, id: z.literal("latest-videos"), type: z.literal("videos"), content: sectionContentSchema }),
  z.object({ ...baseSection, id: z.literal("featured-research"), type: z.literal("research"), content: manualContentSchema }),
]);
export const homepageSnapshotSchema = z.object({ sections: z.array(homepageSectionSchema).max(20), revision: z.number().int().nonnegative(), updatedAt: z.coerce.date() }).superRefine((snapshot, ctx) => { const ids = snapshot.sections.map((section) => section.id); if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Homepage section IDs must be unique." }); for (const section of snapshot.sections) { const expectedId = section.type === "articles" ? "latest-insights" : section.type === "videos" ? "latest-videos" : section.type === "research" ? "featured-research" : section.type; if (section.id !== expectedId) ctx.addIssue({ code: "custom", message: `Invalid section identity: ${section.id}.` }); if (section.type === "hero" && section.content.ids.length !== 1) ctx.addIssue({ code: "custom", message: "Hero must select exactly one item." }); if (section.type === "featured" && section.content.ids.length !== 3) ctx.addIssue({ code: "custom", message: "Featured must select one primary and two supporting items." }); if (section.type === "research" && section.content.ids.length > 2) ctx.addIssue({ code: "custom", message: "Featured Research may select at most two items." }); } });
export const homepageConfigSchema = z.object({ key: z.literal("homepage"), draft: homepageSnapshotSchema, published: homepageSnapshotSchema, draftUpdatedBy: objectIdSchema, publishedBy: objectIdSchema.optional(), publishedAt: z.coerce.date().optional(), updatedAt: z.coerce.date() });
export const mediaAssetInputSchema = z.object({ originalName: z.string().min(1).max(255), mimeType: z.string().min(1), size: z.number().int().positive(), width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), altText: z.string().max(300), caption: z.string().max(500).optional(), focalPoint: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional() }).strict();
