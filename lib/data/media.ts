import "server-only";
import { connectToDatabase } from "../db/mongodb";
import { Article, HomepageConfig, MediaAsset, Research, Video } from "../db/models";
import { mediaDeliveryUrl, mediaSourceFallback } from "../media-url";
const publicUrl = (item: { sourceUrl?: string; objectKey?: string }) => mediaDeliveryUrl(item.objectKey) ?? mediaSourceFallback(item.sourceUrl);
import { requirePermission } from "../permissions";
export type MediaAdminItem = { _id: string; originalName: string; mimeType: string; width?: number; height?: number; size: number; altText?: string; caption?: string; objectKey?: string; sourceUrl?: string; url?: string; createdAt?: Date | string; usageCount?: number };
export async function getMediaAssets(search?: string, type?: "images" | "other", includeUsage = false) {
  await requirePermission("media.read");
  await connectToDatabase();
  const escaped = search?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter: Record<string, unknown> = {};
  if (escaped) filter.$or = [{ originalName: { $regex: escaped, $options: "i" } }, { altText: { $regex: escaped, $options: "i" } }, { caption: { $regex: escaped, $options: "i" } }];
  if (type === "images") filter.mimeType = { $regex: "^image/" };
  if (type === "other") filter.mimeType = { $not: { $regex: "^image/" } };
  const items = await MediaAsset.find(filter).sort({ createdAt: -1 }).populate("createdBy", "name email").lean().exec();
  const mapped = items.map((item) => ({ ...item, _id: String(item._id), url: publicUrl(item as { sourceUrl?: string; objectKey?: string }) })) as unknown as MediaAdminItem[];
  if (!includeUsage || !mapped.length) return mapped;
  return Promise.all(mapped.map(async (item) => {
    const [articles, videos, research, homepage] = await Promise.all([
      Article.countDocuments({ coverMedia: item._id }),
      Video.countDocuments({ $or: [{ thumbnail: item._id }, { media: item._id }] }),
      Research.countDocuments({ $or: [{ coverMedia: item._id }, { pdfMedia: item._id }] }),
      HomepageConfig.exists({ $or: [{ "draft.sections.content.ids": item._id }, { "published.sections.content.ids": item._id }] }),
    ]);
    return { ...item, usageCount: articles + videos + research + (homepage ? 1 : 0) };
  }));
}
