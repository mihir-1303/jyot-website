import { connectToDatabase } from "../lib/db/mongodb-core";
import { HomepageConfig } from "../lib/db/models-core";
import { featuredReferencesFromSections } from "../lib/featured";

async function main() {
  await connectToDatabase();
  const config = await HomepageConfig.findOne({ key: "homepage" }).select("draft published").lean() as unknown as { draft?: { sections?: unknown[] }; published?: { sections?: unknown[] } } | null;
  if (!config) throw new Error("Homepage configuration is not initialized.");
  const draftFeatured = featuredReferencesFromSections(config.draft?.sections ?? []);
  const publishedFeatured = featuredReferencesFromSections(config.published?.sections ?? []);
  await HomepageConfig.updateOne({ key: "homepage" }, { $set: { "draft.featured": draftFeatured, "published.featured": publishedFeatured } });
  console.log(JSON.stringify({ draft: draftFeatured, published: publishedFeatured }, null, 2));
}

void main();
