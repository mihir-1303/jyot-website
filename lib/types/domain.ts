export type Id = string;

export const ROLES = ["ADMIN", "EDITOR", "AUTHOR", "VIEWER", "CONTRIBUTOR"] as const;
export type Role = (typeof ROLES)[number];

export const RESOURCES = ["articles", "videos", "research", "collections", "media", "homepage", "authors", "categories", "tags", "users", "roles", "settings"] as const;
export type Resource = (typeof RESOURCES)[number];
export type PermissionAction = "create" | "read" | "edit" | "editOwn" | "editAll" | "publish" | "delete" | "upload" | "editMetadata" | "view" | "disable";
export type Permission = `${Resource}.${PermissionAction}`;
export type PermissionOverride = { permission: Permission; allowed: boolean };

export type AuditFields = { createdBy: Id; updatedBy: Id; createdAt: Date; updatedAt: Date };
export type ContentStatus = "draft" | "review" | "scheduled" | "published" | "archived";
export type SEOFields = { metaTitle?: string; metaDescription?: string; ogImage?: Id };

export type MediaVariant = { objectKey: string; width: number; height: number; mimeType: string; size?: number };
export type MediaAsset = AuditFields & {
  id: Id; originalName: string; objectKey: string; mimeType: string; size: number;
  width?: number; height?: number; altText: string; caption?: string;
  focalPoint?: { x: number; y: number }; variants: { original: MediaVariant; presentation16x9?: MediaVariant };
};

export type Author = AuditFields & { id: Id; name: string; slug: string; bio?: string; photo?: Id; socialLinks?: Record<string, string> };
export type Category = AuditFields & { id: Id; name: string; slug: string; description?: string };
export type Tag = AuditFields & { id: Id; name: string; slug: string };

export type ContentBase = AuditFields & { id: Id; title: string; slug: string; status: ContentStatus; scheduledAt?: Date; publishedAt?: Date; publishedBySystem?: boolean; featured: boolean; seo?: SEOFields };
export type Article = ContentBase & { excerpt: string; content: unknown; coverMedia: Id; author: Id; category: Id; tags: Id[]; readTime?: string };
export type Video = ContentBase & { description: string; thumbnail: Id; sourceType: "external" | "r2"; provider?: "youtube" | "vimeo" | "other"; externalUrl?: string; media?: Id; duration?: string; author?: Id; category: Id };
export type Research = ContentBase & { description: string; content: unknown; coverMedia: Id; pdfMedia?: Id; authors: Id[]; category: Id; type: string };
export type CollectionItem = { type: "article" | "research" | "video"; contentId: Id; order: number };
export type Collection = ContentBase & { description: string; coverImage?: Id; curator?: Id; items: CollectionItem[] };

export type SectionContent = { mode: "manual"; ids: Id[] } | { mode: "latest"; limit: number; categoryId?: Id; tagIds?: Id[] };
export type HomepageSection =
  | { id: "hero"; type: "hero"; title: string; enabled: boolean; order: number; content: Extract<SectionContent, { mode: "manual" }>; settings?: SectionSettings }
  | { id: "featured"; type: "featured"; title: string; enabled: boolean; order: number; content: Extract<SectionContent, { mode: "manual" }>; settings?: SectionSettings }
  | { id: "latest-insights"; type: "articles"; title: string; enabled: boolean; order: number; content: SectionContent; settings?: SectionSettings }
  | { id: "latest-videos"; type: "videos"; title: string; enabled: boolean; order: number; content: SectionContent; settings?: SectionSettings }
  | { id: "featured-research"; type: "research"; title: string; enabled: boolean; order: number; content: Extract<SectionContent, { mode: "manual" }>; settings?: SectionSettings };
export type SectionSettings = { label?: string; heading?: string; description?: string; ctaLabel?: string; ctaHref?: string };
export type HomepageSnapshot = { sections: HomepageSection[]; revision: number; updatedAt: Date };
export type HomepageConfig = { id: Id; key: "homepage"; draft: HomepageSnapshot; published: HomepageSnapshot; draftRevision: number; publishedRevision: number; draftUpdatedBy: Id; publishedBy?: Id; publishedAt?: Date; updatedAt: Date };

export const isPubliclyPublished = (status: ContentStatus, publishedAt?: Date, now = new Date()) => status === "published" && (!publishedAt || publishedAt <= now);
