import "server-only";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mediaDeliveryUrl } from "../media-url";

const config = { accountId: process.env.R2_ACCOUNT_ID, accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY, bucket: process.env.R2_BUCKET_NAME };
export const isR2Configured = () => Object.values(config).every(Boolean);
function client() { if (!isR2Configured()) throw new Error("R2 setup required: configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME."); return new S3Client({ region: "auto", endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId: config.accessKeyId!, secretAccessKey: config.secretAccessKey! } }); }
export async function putObject(objectKey: string, body: Buffer, contentType: string) { await client().send(new PutObjectCommand({ Bucket: config.bucket, Key: objectKey, Body: body, ContentType: contentType })); }
export async function deleteObject(objectKey: string) { await client().send(new DeleteObjectCommand({ Bucket: config.bucket, Key: objectKey })); }
export async function deleteObjects(keys: string[]) { await Promise.all(keys.filter(Boolean).map(deleteObject)); }
export async function getObject(objectKey: string) { const result = await client().send(new GetObjectCommand({ Bucket: config.bucket, Key: objectKey })); if (!result.Body) throw new Error("Media object was not found."); return Buffer.from(await result.Body.transformToByteArray()); }
export function mediaUrl(objectKey: string) { const url = mediaDeliveryUrl(objectKey); if (!url) throw new Error("Media delivery setup required: configure MEDIA_DELIVERY_BASE_URL."); return url; }
