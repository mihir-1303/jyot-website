"use server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db/mongodb";
import { Article, Author, Category, MediaAsset, Research, Tag, Video } from "../db/models";
import { requirePermission } from "../permissions";
import { articleInputSchema, researchInputSchema, videoInputSchema } from "../validations/content";
import type { Permission } from "../types/domain";
import { localDateTimeToUtc, validateFutureSchedule } from "../scheduling";

function values(formData: FormData) { return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, typeof value === "string" ? value : ""])); }
function ids(value: string) { return value.split(",").map((id) => id.trim()).filter(Boolean); }
function contentValue(value: string) { if (!value) return ""; try { return JSON.parse(value); } catch { return value; } }
async function verifyReferences(data: Record<string, unknown>, kind: "article" | "video" | "research") {
  const unique = (values: unknown[]) => [...new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0))];
  const inlineMedia: string[] = [];
  const visit = (node: unknown) => { if (!node || typeof node !== "object") return; const value = node as { attrs?: { mediaId?: unknown }; content?: unknown[] }; if (typeof value.attrs?.mediaId === "string") inlineMedia.push(value.attrs.mediaId); value.content?.forEach(visit); };
  visit(data.content);
  const mediaRefs = unique([data.coverMedia, data.thumbnail, data.pdfMedia, ...inlineMedia]);
  const authorRefs = unique([data.author, ...(Array.isArray(data.authors) ? data.authors : [])]);
  const tagRefs = unique(Array.isArray(data.tags) ? data.tags : []);
  const [mediaCount, authorCount, categoryCount, tagCount] = await Promise.all([
    MediaAsset.countDocuments({ _id: { $in: mediaRefs } }),
    Author.countDocuments({ _id: { $in: authorRefs } }),
    data.category ? Category.countDocuments({ _id: data.category }) : Promise.resolve(0),
    kind === "article" ? Tag.countDocuments({ _id: { $in: tagRefs } }) : Promise.resolve(0),
  ]);
  if (mediaCount !== mediaRefs.length || (kind === "article" || kind === "research") && authorCount !== authorRefs.length || categoryCount !== (data.category ? 1 : 0) || kind === "article" && tagCount !== tagRefs.length) throw new Error("One or more selected references no longer exist.");
}
async function save(kind: "article" | "video" | "research", formData: FormData) {
  const permissionBase = kind === "article" ? "articles" : kind === "video" ? "videos" : "research";
  const id = String(formData.get("id") ?? "").trim();
  const user = await requirePermission(`${id ? `${permissionBase}.read` : `${permissionBase}.create`}` as Permission);
  await connectToDatabase();
  const raw = values(formData); const Model = kind === "article" ? Article : kind === "video" ? Video : Research;
  const existing = id ? await Model.findById(id).select("slug createdBy publishedAt").lean() as unknown as { slug?: string; createdBy?: unknown; publishedAt?: Date } | null : null;
  if (id && !existing) throw new Error("Content not found.");
  if (existing) {
    const canEditAll = await (async () => { try { await requirePermission(`${permissionBase}.editAll` as Permission); return true; } catch { return false; } })();
    if (!canEditAll) { await requirePermission(`${permissionBase}.editOwn` as Permission); if (String(existing.createdBy) !== user.id) throw new Error("You can only edit content you own."); }
  }
  const status = raw.status || "draft";
  const scheduledAt = status === "scheduled" ? validateFutureSchedule(localDateTimeToUtc(raw.scheduledLocal, raw.scheduledTimezone || "UTC")) : null;
  const slug = raw.slug || slugify(raw.title);
  const duplicate = await Model.exists({ slug, ...(id ? { _id: { $ne: id } } : {}) });
  if (duplicate) throw new Error(`The slug “${slug}” is already in use. Choose a different slug.`);
  const common = { title: raw.title, slug, excerpt: raw.excerpt, content: contentValue(raw.content), status, scheduledAt, publishedAt: status === "published" ? (raw.publishedAt ? new Date(raw.publishedAt) : existing?.publishedAt ?? new Date()) : undefined, seo: raw.metaTitle || raw.metaDescription ? { metaTitle: raw.metaTitle, metaDescription: raw.metaDescription } : undefined, updatedBy: user.id };
  if (status === "published") await requirePermission(`${permissionBase}.publish` as Permission);
  let data: Record<string, unknown>;
  if (kind === "article") data = { ...common, coverMedia: raw.coverMedia || undefined, author: raw.author, category: raw.category, tags: ids(raw.tags), readTime: raw.readTime || undefined };
  else if (kind === "video") data = { ...common, description: raw.description, thumbnail: raw.thumbnail || undefined, provider: raw.provider || undefined, externalUrl: raw.externalUrl || undefined, duration: raw.duration || undefined, author: raw.author || undefined, category: raw.category, sourceType: raw.sourceType || "external", media: raw.media || undefined };
  else data = { ...common, description: raw.description, coverMedia: raw.coverMedia || undefined, pdfMedia: raw.pdfMedia || undefined, authors: ids(raw.authors), category: raw.category, type: raw.type };
  const parsed = (kind === "article" ? articleInputSchema : kind === "video" ? videoInputSchema : researchInputSchema).safeParse(data);
  if (!parsed.success) throw new Error(`Invalid content fields: ${parsed.error.issues.map((issue) => issue.message).join(" ")}`);
  await verifyReferences(parsed.data as Record<string, unknown>, kind);
  if (id) {
    const updateData = { ...parsed.data, updatedBy: user.id } as Record<string, unknown>;
    if (status !== "scheduled") delete updateData.scheduledAt;
    if (status !== "published") delete updateData.publishedAt;
    const unset = status === "published" ? { scheduledAt: "" } : status === "scheduled" ? { publishedAt: "" } : { scheduledAt: "", publishedAt: "" };
    await Model.findByIdAndUpdate(id, { $set: updateData, $unset: unset }, { runValidators: true }).exec();
  }
  else await Model.create({ ...parsed.data, createdBy: user.id, updatedBy: user.id, featured: false } as never);
  revalidatePath("/"); revalidatePath(`/${permissionBase}`); revalidatePath(`/admin/${permissionBase}`); if (existing?.slug) revalidatePath(`/${permissionBase}/${existing.slug}`); revalidatePath(`/${permissionBase}/${slug}`); revalidatePath("/search"); return { ok: true };
}
function slugify(value: string) { const slug = value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180).replace(/-+$/g, ""); if (!slug) throw new Error("A title is required to generate a slug."); return slug; }
export async function saveArticle(formData: FormData) { await save("article", formData); }
export async function saveVideo(formData: FormData) { await save("video", formData); }
export async function saveResearch(formData: FormData) { await save("research", formData); }
export async function deleteContent(kind: "article" | "video" | "research", id: string) { const permission = `${kind === "article" ? "articles" : kind === "video" ? "videos" : "research"}.delete` as Permission; const user = await requirePermission(permission); await connectToDatabase(); const Model = kind === "article" ? Article : kind === "video" ? Video : Research; const existing = await Model.findById(id).select("createdBy slug").lean() as unknown as { createdBy?: unknown; slug?: string } | null; if (!existing) return; const canDeleteAll = await (async () => { try { await requirePermission(`${kind === "article" ? "articles" : kind === "video" ? "videos" : "research"}.editAll` as Permission); return true; } catch { return false; } })(); if (!canDeleteAll && String(existing.createdBy) !== user.id) throw new Error("Forbidden"); await Model.findByIdAndDelete(id); const publicPath = `/${kind}`; revalidatePath("/"); revalidatePath(publicPath); revalidatePath(`/admin/${kind}`); if (existing.slug) revalidatePath(`${publicPath}/${existing.slug}`); }
