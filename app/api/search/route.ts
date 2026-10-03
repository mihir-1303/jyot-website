import { NextResponse } from "next/server";
import { searchPublished } from "../../../lib/search";
import { Collection } from "../../../lib/db/models";
import { connectToDatabase } from "../../../lib/db/mongodb";
import { mediaUrlForAsset } from "../../../lib/media-url";

const publicFilter = { status: "published", $or: [{ publishedAt: { $exists: false } }, { publishedAt: { $lte: new Date() } }] };
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  try {
    const regex = new RegExp(escapeRegex(query), "i");
    const [published, collections] = await Promise.all([
      searchPublished(query, { limit: 8 }),
      (async () => {
        await connectToDatabase();
        return (await Collection.find({ ...publicFilter, $or: [{ title: regex }, { slug: regex }, { description: regex }] })
          .select("title slug description coverImage")
          .populate("coverImage", "objectKey sourceUrl altText variants")
          .sort({ publishedAt: -1 })
          .limit(8)
          .lean()) as unknown as { title: string; slug: string; coverImage?: { objectKey?: string; sourceUrl?: string; altText?: string; variants?: { presentation16x9?: { objectKey?: string } } } }[];
      })(),
    ]);

    const content = published.results
      .filter((item) => item.type === "article" || item.type === "research" || item.type === "video")
      .map((item) => ({ type: item.type, title: item.title, slug: item.slug, href: item.type === "article" ? `/articles/${item.slug}` : item.type === "research" ? `/research/${item.slug}` : `/videos/${item.slug}`, image: item.image, score: item.score }));
    const collectionResults = collections.map((item) => {
      const cover = item.coverImage as { objectKey?: string; sourceUrl?: string; altText?: string; variants?: { presentation16x9?: { objectKey?: string } } } | undefined;
      const key = cover?.variants?.presentation16x9?.objectKey ?? cover?.objectKey;
      return { type: "collection" as const, title: item.title, slug: item.slug, href: `/collections/${item.slug}`, image: key ? { url: mediaUrlForAsset(key, cover?.sourceUrl) ?? "", altText: cover?.altText } : undefined, score: regex.test(item.title) ? 75 : 35 };
    });

    return NextResponse.json({ results: [...content, ...collectionResults].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 8).map(({ score, ...item }) => { void score; return item; }) });
  } catch {
    return NextResponse.json({ results: [], unavailable: true }, { status: 503 });
  }
}
