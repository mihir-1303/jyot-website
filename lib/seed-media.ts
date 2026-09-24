import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isR2Configured, objectExists, putObject } from "./storage/r2-core";
import type { MediaAsset } from "./mockData";

const localSeedPaths = (item: MediaAsset) => [join(process.cwd(), "public", "seed", item.originalName), join(process.cwd(), "seed", item.originalName)];

async function localSeedBuffer(item: MediaAsset) {
  for (const path of localSeedPaths(item)) {
    try { return await readFile(path); } catch (error) { if ((error as { code?: string }).code !== "ENOENT") throw error; }
  }
  return undefined;
}

async function sourceBuffer(item: MediaAsset) {
  const local = await localSeedBuffer(item);
  if (local) return local;
  const response = await fetch(item.url);
  if (!response.ok) throw new Error(`Seed source download failed for ${item.id}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function ensureSeedMediaObjects(items: MediaAsset[]) {
  if (!isR2Configured()) throw new Error("Seed media requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.");
  const results: { objectKey: string; status: "existing" | "uploaded" }[] = [];
  for (const item of items) {
    const objectKey = `seed/${item.id}.jpg`;
    if (await objectExists(objectKey)) { results.push({ objectKey, status: "existing" }); continue; }
    const body = await sourceBuffer(item);
    await putObject(objectKey, body, item.mimeType);
    if (!(await objectExists(objectKey))) throw new Error(`Seed media upload could not be verified: ${objectKey}`);
    results.push({ objectKey, status: "uploaded" });
  }
  return results;
}
