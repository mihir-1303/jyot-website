import { loadEnvConfig } from "@next/env";
import { ensureSeedMediaObjects } from "../lib/seed-media";
import { mediaAssets } from "../lib/mockData";

loadEnvConfig(process.cwd());

ensureSeedMediaObjects(mediaAssets).then((results) => {
  for (const result of results) console.log(`${result.status}: ${result.objectKey}`);
}).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
