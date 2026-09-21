import "server-only";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { connectToDatabase } from "../db/mongodb";
import { MediaAsset } from "../db/models";
import { requirePermission } from "../permissions";
import { deleteObjects, putObject } from "./r2";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = Number(process.env.MEDIA_MAX_IMAGE_BYTES ?? 10 * 1024 * 1024);
export const MAX_PDF_BYTES = Number(process.env.MEDIA_MAX_PDF_BYTES ?? 25 * 1024 * 1024);
const focalSchema = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });
const safeName = (name: string) => name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "").slice(0, 100) || "upload";
const keyFor = (name: string) => { const now = new Date(); return `media/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-${safeName(name)}`; };
function pdf(buffer: Buffer) { return buffer.subarray(0, 5).toString("ascii") === "%PDF-"; }
async function imageInfo(buffer: Buffer, declaredType: string) { if (!(IMAGE_TYPES as readonly string[]).includes(declaredType)) throw new Error("Unsupported image type."); const info = await sharp(buffer).metadata(); if (!info.format || !info.width || !info.height) throw new Error("Invalid image file."); const actual = `image/${info.format === "jpeg" ? "jpeg" : info.format}`; if (actual !== declaredType) throw new Error("Image MIME type does not match its contents."); return info; }
export async function uploadMediaFile(file: File, altText: string, focalPoint?: { x: number; y: number }) { const user = await requirePermission("media.upload"); if (!file || file.size <= 0) throw new Error("A file is required."); const buffer = Buffer.from(await file.arrayBuffer()); const isImage = (IMAGE_TYPES as readonly string[]).includes(file.type); const isPdf = file.type === "application/pdf"; if (!isImage && !isPdf) throw new Error("Only JPEG, PNG, WebP, and PDF files are supported."); const max = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES; if (file.size > max) throw new Error("File exceeds the configured upload limit."); const key = keyFor(file.name); const keys = [key]; let width: number | undefined; let height: number | undefined; let variant: { objectKey: string; width: number; height: number; mimeType: string; size: number } | undefined;
  try { if (isImage) { const info = await imageInfo(buffer, file.type); width = info.width; height = info.height; const point = focalPoint ?? { x: 0.5, y: 0.5 }; focalSchema.parse(point); const output = await sharp(buffer).resize({ width: 1600, height: 900, fit: "cover", position: `${Math.round(point.x * 100)}% ${Math.round(point.y * 100)}%` }).jpeg({ quality: 86 }).toBuffer(); const variantKey = `${key}.16x9.jpg`; await putObject(key, buffer, file.type); await putObject(variantKey, output, "image/jpeg"); keys.push(variantKey); variant = { objectKey: variantKey, width: 1600, height: 900, mimeType: "image/jpeg", size: output.byteLength }; } else { if (!pdf(buffer)) throw new Error("Invalid PDF file."); await putObject(key, buffer, "application/pdf"); } await connectToDatabase(); const created = await MediaAsset.create({ originalName: file.name, objectKey: key, mimeType: file.type, size: file.size, width, height, altText, focalPoint, variants: { original: { objectKey: key, width, height, mimeType: file.type, size: file.size }, ...(variant ? { presentation16x9: variant } : {}) }, createdBy: user.id, updatedBy: user.id } as never); return created; } catch (error) { try { await deleteObjects(keys); } catch { /* best-effort cleanup */ } throw error; }
}
