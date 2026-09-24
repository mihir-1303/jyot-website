export type MediaAsset = {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  r2Key: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
  altText: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
};

export type Author = { id: string; name: string; slug: string; bio?: string };
export type Category = { id: string; name: string; slug: string; description?: string };
export type ContentStatus = "draft" | "published" | "archived";

export type Article = {
  id: string; title: string; slug: string; excerpt: string; content: unknown;
  featuredImage: MediaAsset; author: Author; category: Category; tags: string[];
  status: ContentStatus; featured: boolean; publishedAt: string; createdAt: string; updatedAt: string;
  readTime: string;
};

export type Video = {
  id: string; title: string; slug: string; description: string; thumbnail: MediaAsset;
  provider: "youtube" | "vimeo" | "self-hosted"; videoUrl: string; duration: string;
  author?: Author; category: Category; status: ContentStatus; featured: boolean;
  publishedAt: string; createdAt: string; updatedAt: string;
};

export type Research = {
  id: string; title: string; slug: string; description: string; coverImage: MediaAsset;
  authors: Author[]; category: Category; type: string; status: ContentStatus;
  featured: boolean; publishedAt: string; createdAt: string; updatedAt: string;
};

export type FeaturedStory = Article;
export type SectionSelection = { mode: "manual" | "latest"; ids?: string[]; limit?: number };
export type HomepageSection = {
  id: string; type: "hero" | "featured" | "articles" | "videos" | "research";
  title: string; enabled: boolean; order: number;
  content?: SectionSelection;
  settings?: { label?: string; heading?: string; description?: string; ctaLabel?: string; ctaHref?: string };
};
export type HomepageConfig = { sections: HomepageSection[] };
export type HomepageData = { config: HomepageConfig; articles: Article[]; videos: Video[]; research: Research[] };

const now = "2026-09-15T00:00:00.000Z";
const image = (id: string, altText: string): MediaAsset => ({
  id, filename: `${id}.jpg`, originalName: `${id}.jpg`, url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=85`,
  r2Key: `media/${id}.jpg`, mimeType: "image/jpeg", width: 1600, height: 900, size: 0, altText, createdAt: now, updatedAt: now,
});
const author = (id: string, name: string): Author => ({ id, name, slug: id });
const category = (id: string, name: string): Category => ({ id, name, slug: id });
const people = author("jyot-research-desk", "Jyot Research Desk");
const economy = category("economy", "Economy");
const climate = category("climate", "Climate");
const technology = category("technology", "Technology");
const ideas = category("ideas", "Ideas");
const articleRichTextSample = { type: "doc", content: [
  { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "A broader idea of prosperity" }] },
  { type: "paragraph", content: [{ type: "text", text: "Shared prosperity begins with the systems and choices that shape everyday life. " }, { type: "text", text: "Bold perspective", marks: [{ type: "bold" }] }, { type: "text", text: " and " }, { type: "text", text: "italic context", marks: [{ type: "italic" }] }, { type: "text", text: " plus " }, { type: "text", text: "an underlined signal", marks: [{ type: "underline" }] }] },
  { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Listen to local experience" }] }] }, { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Design for participation" }] }] }] },
  { type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Start with trust" }] }] }, { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Measure what matters" }] }] }] },
  { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "The measure of progress is whether more people can shape the future." }] }] },
] };
const videoRichTextSample = JSON.stringify({ type: "doc", content: [
  { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "The choices behind a changing world" }] },
  { type: "paragraph", content: [{ type: "text", text: "This conversation connects " }, { type: "text", text: "bold ideas", marks: [{ type: "bold" }] }, { type: "text", text: ", " }, { type: "text", text: "italic questions", marks: [{ type: "italic" }] }, { type: "text", text: " and " }, { type: "text", text: "underlined evidence", marks: [{ type: "underline" }] }, { type: "text", text: "." }] },
  { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "People and institutions" }] }] }, { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Technology and dignity" }] }] }] },
  { type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Watch the opening exchange" }] }] }, { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Stay for the practical lessons" }] }] }] },
  { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Good questions make room for better futures." }] }] },
] });
const articleRichTextSampleTwo = { type: "doc", content: [
  { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Adaptation is an everyday practice" }] },
  { type: "paragraph", content: [{ type: "text", text: "Climate resilience is built through " }, { type: "text", text: "patient local work", marks: [{ type: "bold" }] }, { type: "text", text: " and careful listening. " }, { type: "hardBreak" }, { type: "text", text: "The most useful plans leave room to learn." }] },
  { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Preparation is strongest when it is shared." }] }] },
  { type: "orderedList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Map the risks people already understand" }] }] }, { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Fund the practical next step" }] }] }] },
] };
const articleRichTextSampleThree = { type: "doc", content: [
  { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "A long view for technology" }] },
  { type: "paragraph", content: [{ type: "text", text: "Strategic autonomy depends on people, institutions and " }, { type: "text", text: "open collaboration", marks: [{ type: "underline" }, { type: "italic" }] }, { type: "text", text: "." }] },
  { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Invest in skills" }] }] }, { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Build trusted infrastructure" }] }] }] },
] };

export const mediaAssets: MediaAsset[] = [
  image("photo-1532664189809-02133fee698d", "People gathering at an Indian market at golden hour"),
  image("photo-1494526585095-c41746248156", "A dense Indian city neighborhood"),
  image("photo-1500534623283-312aade485b7", "A community beside a changing river"),
  image("photo-1516026672322-bc52d61a55d5", "A landscape shaped by shared prosperity"),
  image("photo-1524492412937-b28074a5d7da", "India Gate in New Delhi"),
  image("photo-1533130061792-64b345e4a833", "A green South Asian landscape"),
  image("photo-1518770660439-4636190af475", "A semiconductor circuit board"),
  image("photo-1529107386315-e1a2ed48a620", "A conversation on a studio stage"),
  image("photo-1449824913935-59a10b8d2000", "A South Asian city street"),
  image("photo-1521737711867-e3b97375f902", "People collaborating around a table"),
  image("photo-1500530855697-b586d89ba3ee", "A wide mountain horizon"),
  image("photo-1470071459604-3b5ec3a7fe05", "A quiet landscape at dawn"),
];
const asset = (id: string) => mediaAssets.find((item) => item.id === id)!;

export const articles: Article[] = [
  { id: "trade", title: "India’s Trade Strategy in a Fragmented World", slug: "indias-trade-strategy", excerpt: "As global trade realigns, India has an opportunity to build more resilient and inclusive trade partnerships.", content: "", featuredImage: asset("photo-1524492412937-b28074a5d7da"), author: author("rohan-mehta", "Rohan Mehta"), category: economy, tags: ["trade"], status: "published", featured: false, publishedAt: "2026-09-15", createdAt: now, updatedAt: now, readTime: "6 min read" },
  { id: "climate", title: "Rethinking Climate Adaptation for South Asia", slug: "climate-adaptation-south-asia", excerpt: "The region’s next climate story will be shaped by the everyday choices that make cities and communities more prepared.", content: "", featuredImage: asset("photo-1533130061792-64b345e4a833"), author: author("ananya-rao", "Ananya Rao"), category: climate, tags: ["adaptation"], status: "published", featured: false, publishedAt: "2026-09-14", createdAt: now, updatedAt: now, readTime: "8 min read" },
  { id: "chips", title: "Semiconductors and Strategic Autonomy for India", slug: "semiconductors-strategic-autonomy", excerpt: "Building a trusted semiconductor ecosystem calls for patient capital, skilled people and a long view.", content: "", featuredImage: asset("photo-1518770660439-4636190af475"), author: author("vikram-sethi", "Vikram Sethi"), category: technology, tags: ["technology"], status: "published", featured: false, publishedAt: "2026-09-12", createdAt: now, updatedAt: now, readTime: "7 min read" },
  { id: "future-cities", title: "The Everyday Work of Building Better Cities", slug: "everyday-work-better-cities", excerpt: "Across India, a quieter transformation is changing how people experience public life, opportunity and belonging.", content: "", featuredImage: asset("photo-1494526585095-c41746248156"), author: people, category: ideas, tags: ["cities"], status: "published", featured: true, publishedAt: "2026-09-11", createdAt: now, updatedAt: now, readTime: "9 min read" },
  { id: "water-futures", title: "Water Futures Begin with Local Choices", slug: "water-futures-local-choices", excerpt: "What communities can teach us about adapting to an uncertain climate.", content: "", featuredImage: asset("photo-1500534623283-312aade485b7"), author: people, category: climate, tags: ["water"], status: "published", featured: true, publishedAt: "2026-09-10", createdAt: now, updatedAt: now, readTime: "5 min read" },
  { id: "new-neighbors", title: "A New Language for Shared Prosperity", slug: "new-language-shared-prosperity", excerpt: "Why inclusive growth needs more than a new set of numbers.", content: "", featuredImage: asset("photo-1516026672322-bc52d61a55d5"), author: people, category: economy, tags: ["development"], status: "published", featured: true, publishedAt: "2026-09-09", createdAt: now, updatedAt: now, readTime: "6 min read" },
];

export const videos: Video[] = [
  { id: "multipolar", title: "India in a Multipolar World: Opportunities and Challenges", slug: "india-multipolar-world", description: "A candid conversation on India’s choices in a changing global order.", thumbnail: asset("photo-1529107386315-e1a2ed48a620"), provider: "youtube", videoUrl: "", duration: "42:16", category: ideas, status: "published", featured: false, publishedAt: "2026-09-12", createdAt: now, updatedAt: now },
  { id: "cities", title: "Can Our Cities Adapt to a Warmer Future?", slug: "cities-warmer-future", description: "What resilient urban planning looks like on the ground across South Asia.", thumbnail: asset("photo-1449824913935-59a10b8d2000"), provider: "youtube", videoUrl: "", duration: "18:42", category: climate, status: "published", featured: false, publishedAt: "2026-09-08", createdAt: now, updatedAt: now },
  { id: "work", title: "The Future of Work Is Already Here", slug: "future-of-work", description: "Three perspectives on technology, dignity and the next generation of work.", thumbnail: asset("photo-1521737711867-e3b97375f902"), provider: "youtube", videoUrl: "", duration: "27:05", category: ideas, status: "published", featured: false, publishedAt: "2026-09-04", createdAt: now, updatedAt: now },
];

const articleSample = articles.find((item) => item.slug === "new-language-shared-prosperity");
if (articleSample) articleSample.content = articleRichTextSample;
const articleSampleTwo = articles.find((item) => item.slug === "climate-adaptation-south-asia");
if (articleSampleTwo) articleSampleTwo.content = articleRichTextSampleTwo;
const articleSampleThree = articles.find((item) => item.slug === "semiconductors-strategic-autonomy");
if (articleSampleThree) articleSampleThree.content = articleRichTextSampleThree;
const videoSample = videos.find((item) => item.slug === "india-multipolar-world");
if (videoSample) videoSample.description = videoRichTextSample;
const videoSampleTwo = videos.find((item) => item.slug === "cities-warmer-future");
if (videoSampleTwo) videoSampleTwo.description = videoRichTextSample;

export const research: Research[] = [
  { id: "order", title: "India and the New Global Order", slug: "india-new-global-order", description: "How can India navigate a more uncertain, multipolar world?", coverImage: asset("photo-1500530855697-b586d89ba3ee"), authors: [people], category: ideas, type: "Featured Report", status: "published", featured: true, publishedAt: "2026-09-01", createdAt: now, updatedAt: now },
  { id: "development", title: "A Changing World: New Perspectives on Development", slug: "new-perspectives-development", description: "Rethinking the relationships between growth, agency and a good life.", coverImage: asset("photo-1470071459604-3b5ec3a7fe05"), authors: [author("mira-kapoor", "Mira Kapoor")], category: ideas, type: "Featured Analysis", status: "published", featured: true, publishedAt: "2026-08-01", createdAt: now, updatedAt: now },
];

export const homepageData: HomepageData = {
  config: { sections: [
    { id: "hero", type: "hero", title: "Hero", enabled: true, order: 1, content: { mode: "manual", ids: ["future-cities"] }, settings: { label: "Ideas for a More Inclusive Tomorrow", heading: "Deeper Perspectives for a Changing World", description: "At Jyot, we explore people, policies and ideas that can build a more inclusive, sustainable and peaceful future.", ctaLabel: "Explore Our Research", ctaHref: "#research" } },
    { id: "featured", type: "featured", title: "Featured", enabled: true, order: 2, content: { mode: "manual", ids: ["future-cities", "water-futures", "new-neighbors"] } },
    { id: "insights", type: "articles", title: "Latest Insights", enabled: true, order: 3, content: { mode: "latest", limit: 3 } },
    { id: "videos", type: "videos", title: "Latest Videos", enabled: true, order: 4, content: { mode: "latest", limit: 3 } },
    { id: "research", type: "research", title: "Featured Research", enabled: true, order: 5, content: { mode: "manual", ids: ["order", "development"] } },
  ] }, articles, videos, research,
};
