import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mediaDeliveryUrl } from "../media-url";

const config = () => ({ accountId: process.env.R2_ACCOUNT_ID, accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY, bucket: process.env.R2_BUCKET_NAME });
export const isR2Configured = () => Object.values(config()).every(Boolean);
function client() { const values = config(); if (!Object.values(values).every(Boolean)) throw new Error("R2 setup required: configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME."); return new S3Client({ region: "auto", endpoint: `https://${values.accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId: values.accessKeyId!, secretAccessKey: values.secretAccessKey! } }); }
export async function putObject(objectKey: string, body: Buffer, contentType: string) { const values = config(); await client().send(new PutObjectCommand({ Bucket: values.bucket, Key: objectKey, Body: body, ContentType: contentType })); }
export async function deleteObject(objectKey: string) { const values = config(); await client().send(new DeleteObjectCommand({ Bucket: values.bucket, Key: objectKey })); }
export async function deleteObjects(keys: string[]) { await Promise.all(keys.filter(Boolean).map(deleteObject)); }
export async function getObject(objectKey: string) { const values = config(); const result = await client().send(new GetObjectCommand({ Bucket: values.bucket, Key: objectKey })); if (!result.Body) throw new Error("Media object was not found."); return Buffer.from(await result.Body.transformToByteArray()); }
export async function objectExists(objectKey: string) { try { const values = config(); await client().send(new HeadObjectCommand({ Bucket: values.bucket, Key: objectKey })); return true; } catch (error) { const detail = error as { $metadata?: { httpStatusCode?: number }; name?: string }; if (detail.$metadata?.httpStatusCode === 404 || detail.name === "NotFound" || detail.name === "NoSuchKey") return false; throw error; } }
export function mediaUrl(objectKey: string) { const url = mediaDeliveryUrl(objectKey); if (!url) throw new Error("Media delivery setup required: configure MEDIA_DELIVERY_BASE_URL."); return url; }
