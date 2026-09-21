import mongoose, { Schema, type Model } from "mongoose";

const opts = { timestamps: true, versionKey: false as const };
const ref = (name: string) => ({ type: Schema.Types.ObjectId, ref: name, required: true });
const seo = new Schema({ metaTitle: String, metaDescription: String, ogImage: { type: Schema.Types.ObjectId, ref: "MediaAsset" } }, { _id: false });
const mediaVariant = new Schema({ objectKey: { type: String, required: true }, width: Number, height: Number, mimeType: { type: String, required: true }, size: Number }, { _id: false });
const audit = { createdBy: ref("User"), updatedBy: ref("User") };

const userSchema = new Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true, index: true }, passwordHash: String, role: { type: String, enum: ["ADMIN", "EDITOR", "AUTHOR", "VIEWER", "CONTRIBUTOR"], required: true }, permissionOverrides: [{ permission: String, allowed: Boolean }], disabledAt: Date }, opts);
const authorSchema = new Schema({ legacyId: String, name: { type: String, required: true }, slug: { type: String, required: true, unique: true }, bio: String, photo: { type: Schema.Types.ObjectId, ref: "MediaAsset" }, socialLinks: Schema.Types.Mixed, ...audit }, opts);
const categorySchema = new Schema({ legacyId: String, name: { type: String, required: true }, slug: { type: String, required: true, unique: true }, description: String, ...audit }, opts);
const tagSchema = new Schema({ legacyId: String, name: { type: String, required: true }, slug: { type: String, required: true, unique: true }, ...audit }, opts);
const contentBase = { legacyId: String, title: { type: String, required: true }, slug: { type: String, required: true, unique: true }, status: { type: String, enum: ["draft", "review", "scheduled", "published", "archived"], default: "draft", index: true }, scheduledAt: { type: Date, index: true }, publishedAt: { type: Date, index: true }, publishedBySystem: { type: Boolean, default: false }, featured: { type: Boolean, default: false }, seo, ...audit };
const articleSchema = new Schema({ ...contentBase, excerpt: { type: String, required: true }, content: { type: Schema.Types.Mixed, required: true }, coverMedia: ref("MediaAsset"), author: ref("Author"), category: ref("Category"), tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }], readTime: String }, opts);
const videoSchema = new Schema({ ...contentBase, description: { type: String, required: true }, thumbnail: ref("MediaAsset"), sourceType: { type: String, enum: ["external", "r2"], required: true }, provider: { type: String, enum: ["youtube", "vimeo", "other"] }, externalUrl: String, media: { type: Schema.Types.ObjectId, ref: "MediaAsset" }, duration: String, author: { type: Schema.Types.ObjectId, ref: "Author" }, category: ref("Category") }, opts);
const researchSchema = new Schema({ ...contentBase, description: { type: String, required: true }, content: { type: Schema.Types.Mixed, required: true }, coverMedia: ref("MediaAsset"), pdfMedia: { type: Schema.Types.ObjectId, ref: "MediaAsset" }, authors: [{ type: Schema.Types.ObjectId, ref: "Author" }], category: ref("Category"), type: { type: String, required: true } }, opts);
const collectionItemSchema = new Schema({ type: { type: String, enum: ["article", "research", "video"], required: true }, contentId: { type: Schema.Types.ObjectId, required: true }, order: { type: Number, required: true } }, { _id: false });
const collectionSchema = new Schema({ ...contentBase, description: { type: String, required: true }, coverImage: { type: Schema.Types.ObjectId, ref: "MediaAsset" }, curator: { type: Schema.Types.ObjectId, ref: "Author" }, items: { type: [collectionItemSchema], default: [] }, ...audit }, opts);
const mediaSchema = new Schema({ originalName: { type: String, required: true }, objectKey: { type: String, required: true, unique: true }, sourceUrl: String, mimeType: { type: String, required: true }, size: { type: Number, required: true }, width: Number, height: Number, altText: { type: String, default: "" }, caption: String, focalPoint: { x: Number, y: Number }, variants: { original: { type: mediaVariant, required: true }, presentation16x9: mediaVariant }, ...audit }, opts);
const sectionSchema = new Schema({ id: { type: String, required: true }, type: { type: String, enum: ["hero", "featured", "articles", "videos", "research", "research-explorer", "topic", "collection"], required: true }, title: { type: String, required: true }, enabled: Boolean, order: Number, content: Schema.Types.Mixed, settings: Schema.Types.Mixed }, { _id: false });
const snapshotSchema = new Schema({ sections: [sectionSchema], revision: Number, updatedAt: Date }, { _id: false });
const homepageRevisionSchema = new Schema({ revision: { type: Number, required: true }, snapshot: { type: snapshotSchema, required: true }, createdAt: { type: Date, default: Date.now }, createdBy: { type: Schema.Types.ObjectId, ref: "User" }, publishedAt: Date }, { _id: false });
const homepageSchema = new Schema({ key: { type: String, enum: ["homepage"], unique: true, required: true }, draft: { type: snapshotSchema, required: true }, published: { type: snapshotSchema, required: true }, revisions: { type: [homepageRevisionSchema], default: [] }, draftRevision: { type: Number, default: 1 }, publishedRevision: { type: Number, default: 1 }, draftUpdatedBy: ref("User"), publishedBy: { type: Schema.Types.ObjectId, ref: "User" }, publishedAt: Date, ...audit }, opts);

for (const schema of [articleSchema, videoSchema, researchSchema]) schema.index({ status: 1, publishedAt: -1 });
for (const schema of [articleSchema, videoSchema, researchSchema]) schema.index({ status: 1, scheduledAt: 1 });
articleSchema.index({ category: 1, publishedAt: -1 });
videoSchema.index({ category: 1, publishedAt: -1 });
researchSchema.index({ category: 1, publishedAt: -1 });
collectionSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ tags: 1, publishedAt: -1 });
mediaSchema.index({ mimeType: 1, createdAt: -1 });

export const User = (mongoose.models.User as Model<unknown>) || mongoose.model("User", userSchema);
export const Author = (mongoose.models.Author as Model<unknown>) || mongoose.model("Author", authorSchema);
export const Category = (mongoose.models.Category as Model<unknown>) || mongoose.model("Category", categorySchema);
export const Tag = (mongoose.models.Tag as Model<unknown>) || mongoose.model("Tag", tagSchema);
export const Article = (mongoose.models.Article as Model<unknown>) || mongoose.model("Article", articleSchema);
export const Video = (mongoose.models.Video as Model<unknown>) || mongoose.model("Video", videoSchema);
export const Research = (mongoose.models.Research as Model<unknown>) || mongoose.model("Research", researchSchema);
export const Collection = (mongoose.models.Collection as Model<unknown>) || mongoose.model("Collection", collectionSchema);
export const MediaAsset = (mongoose.models.MediaAsset as Model<unknown>) || mongoose.model("MediaAsset", mediaSchema);
export const HomepageConfig = (mongoose.models.HomepageConfig as Model<unknown>) || mongoose.model("HomepageConfig", homepageSchema);
