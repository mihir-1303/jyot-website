import assert from "node:assert/strict";
import { isPubliclyPublished } from "../lib/types/domain";
import { homepageSnapshotSchema } from "../lib/validations/domain";
import { articleInputSchema } from "../lib/validations/content";
import { hasRolePermission } from "../lib/rbac/policy";
import { renderToStaticMarkup } from "react-dom/server";
import { StructuredContent } from "../components/StructuredContent";
import { canonical, editorialMetadata } from "../lib/seo";
import { normalizeQuery } from "../lib/search-utils";
import { localDateTimeToUtc, validateFutureSchedule } from "../lib/scheduling";

const id = "507f1f77bcf86cd799439011";
const now = new Date("2026-09-17T00:00:00.000Z");

assert.equal(isPubliclyPublished("published", new Date("2026-09-16T00:00:00.000Z"), now), true);
assert.equal(isPubliclyPublished("draft", undefined, now), false);
assert.equal(isPubliclyPublished("published", new Date("2026-09-18T00:00:00.000Z"), now), false);

const valid = {
  revision: 1,
  updatedAt: now,
  sections: [
    { id: "hero", type: "hero", title: "Hero", enabled: true, order: 0, content: { mode: "manual", ids: [id] } },
    { id: "featured", type: "featured", title: "Featured", enabled: true, order: 1, content: { mode: "manual", ids: [id, id, id] } },
    { id: "latest-insights", type: "articles", title: "Insights", enabled: true, order: 2, content: { mode: "latest", limit: 3 } },
    { id: "latest-videos", type: "videos", title: "Videos", enabled: true, order: 3, content: { mode: "latest", limit: 3 } },
    { id: "featured-research", type: "research", title: "Research", enabled: true, order: 4, content: { mode: "manual", ids: [id] } },
  ],
};
assert.equal(homepageSnapshotSchema.safeParse(valid).success, true);
assert.equal(homepageSnapshotSchema.safeParse({ ...valid, sections: [valid.sections[0], { ...valid.sections[0], id: "hero" }] }).success, false);
assert.equal(homepageSnapshotSchema.safeParse({ ...valid, sections: [{ ...valid.sections[0], id: "unknown", type: "unknown" }] }).success, false);

assert.equal(hasRolePermission("ADMIN", "homepage.publish"), true);
assert.equal(hasRolePermission("AUTHOR", "articles.editOwn"), true);
assert.equal(hasRolePermission("AUTHOR", "articles.publish"), false);
assert.equal(hasRolePermission("AUTHOR", "homepage.edit"), false);
assert.equal(hasRolePermission("AUTHOR", "homepage.edit", [{ permission: "homepage.edit", allowed: true }]), true);

const structured = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Safe", marks: [{ type: "bold" }] }] }, { type: "image", attrs: { mediaId: id, src: "https://images.unsplash.com/example.jpg", alt: "Editorial image" } }] };
assert.equal(articleInputSchema.safeParse({ title: "A valid article", slug: "valid-article", excerpt: "Summary", content: structured, author: id, category: id, tags: [id], status: "draft" }).success, true);
assert.equal(articleInputSchema.safeParse({ title: "A valid article", slug: "valid-article", excerpt: "Summary", content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "bad", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] }] }, author: id, category: id, tags: [], status: "draft" }).success, false);
assert.equal(articleInputSchema.safeParse({ title: "A valid article", slug: "valid-article", excerpt: "Summary", content: "Legacy body", author: id, category: id, tags: [], status: "draft" }).success, true);
const rendered = renderToStaticMarkup(StructuredContent({ content: { type: "doc", content: structured.content.slice(0, 1) } }));
assert.match(rendered, /Safe/);
assert.doesNotMatch(rendered, /javascript:/i);
assert.equal(canonical("articles/example"), "http://localhost:3000/articles/example");
assert.equal((editorialMetadata({ title: "Example", path: "/articles/example" }).alternates as { canonical: string }).canonical, "http://localhost:3000/articles/example");
assert.equal(normalizeQuery(" <script>  climate </script> "), "script  climate /script");
assert.equal(normalizeQuery("a"), "a");
assert.equal(localDateTimeToUtc("2026-09-17T18:30", "Asia/Kolkata").toISOString(), "2026-09-17T13:00:00.000Z");
assert.throws(() => validateFutureSchedule(new Date("2026-09-16T00:00:00.000Z"), now), /future/);

console.log("Phase 7 foundation tests passed.");
