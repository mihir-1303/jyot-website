import { HomepageManager } from "../../../components/cms/HomepageManager";
import { discardHomepageDraft, publishHomepage, restoreHomepageRevision, saveHomepageDraft } from "../../../lib/cms/homepage-actions";
import { getHomepageManagerData } from "../../../lib/data/admin";
import { requirePermission } from "../../../lib/permissions";
import { mediaUrlForAsset } from "../../../lib/media-url";

export default async function HomepagePage() {
  await requirePermission("homepage.view"); const data = await getHomepageManagerData(); if (!data.config) return <p>Homepage configuration is not initialized. Run the database seed first.</p>;
  const config = data.config as unknown as { draft: { sections: unknown[]; revision?: number }; draftRevision?: number; publishedRevision?: number; revisions?: { revision: number; createdAt?: string; publishedAt?: string; createdBy?: { name?: string } }[] };
  const serialize = (value: unknown) => JSON.parse(JSON.stringify(value));
  const mediaUrl = (value: unknown) => { const item = value as { sourceUrl?: string; objectKey?: string; variants?: { presentation16x9?: { objectKey?: string } } } | undefined; return mediaUrlForAsset(item?.variants?.presentation16x9?.objectKey ?? item?.objectKey, item?.sourceUrl) ?? undefined; };
  const candidate = (item: typeof data.articles[number], type: "article" | "video" | "research", media: unknown) => ({ id: String(item._id), title: String(item.title), type, image: mediaUrl(media), status: String(item.status ?? "published"), publishedAt: item.publishedAt?.toISOString?.() ?? undefined });
  const candidates = { articles: data.articles.map((item) => candidate(item, "article", item.coverMedia)), videos: data.videos.map((item) => candidate(item, "video", item.thumbnail)), research: data.research.map((item) => candidate(item, "research", item.coverMedia)), categories: data.categories.map((item) => ({ id: String(item._id), name: item.name })) };
  return <main><p className="eyebrow">Homepage Manager</p><h1 className="serif mt-3 text-6xl">Homepage builder</h1><p className="mt-4 text-[var(--muted)]">Draft revision {config.draftRevision ?? config.draft.revision ?? 1} · Published revision {config.publishedRevision ?? 1}</p><HomepageManager initial={{ sections: serialize(config.draft.sections), revision: config.draftRevision ?? config.draft.revision ?? 1 }} candidates={candidates} history={serialize(config.revisions ?? [])} saveAction={saveHomepageDraft} publishAction={publishHomepage} discardAction={discardHomepageDraft} restoreAction={restoreHomepageRevision} /></main>;
}
