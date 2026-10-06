import { NextResponse } from "next/server";
import { searchPublished } from "../../../lib/search";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  try {
    const published = await searchPublished(query, { limit: 8 });

    const content = published.results
      .filter((item) => item.type === "article" || item.type === "research" || item.type === "video")
      .map((item) => ({ type: item.type, title: item.title, slug: item.slug, href: item.type === "article" ? `/articles/${item.slug}` : item.type === "research" ? `/research/${item.slug}` : `/videos/${item.slug}`, image: item.image, score: item.score }));
    return NextResponse.json({ results: content.slice(0, 8).map(({ score, ...item }) => { void score; return item; }) });
  } catch {
    return NextResponse.json({ results: [], unavailable: true }, { status: 503 });
  }
}
