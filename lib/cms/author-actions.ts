"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db/mongodb";
import { Article, Author, MediaAsset, Research, Video } from "../db/models";
import { requirePermission } from "../permissions";

function slugify(value: string) { const slug = value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); if (!slug) throw new Error("A name is required to generate a slug."); return slug; }

export async function saveAuthor(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  await requirePermission(id ? "authors.edit" : "authors.create"); await connectToDatabase();
  const name = String(formData.get("name") ?? "").trim(); const slug = String(formData.get("slug") ?? "").trim() || slugify(name); const photo = String(formData.get("photo") ?? "").trim();
  if (!name) throw new Error("Author name is required.");
  if (await Author.exists({ slug, ...(id ? { _id: { $ne: id } } : {}) })) throw new Error(`The slug “${slug}” is already in use.`);
  if (photo && !(await MediaAsset.exists({ _id: photo }))) throw new Error("The selected profile image no longer exists.");
  const data = { name, slug, bio: String(formData.get("bio") ?? "").trim(), photo: photo || undefined };
  if (id) await Author.findByIdAndUpdate(id, { $set: data }, { runValidators: true }); else await Author.create(data);
  revalidatePath("/admin/authors"); revalidatePath("/admin/articles"); revalidatePath("/admin/videos"); revalidatePath("/admin/research"); return { ok: true };
}

export async function deleteAuthor(id: string) {
  await requirePermission("authors.delete"); await connectToDatabase();
  const [article, video, research] = await Promise.all([Article.exists({ author: id }), Video.exists({ author: id }), Research.exists({ authors: id })]);
  if (article || video || research) throw new Error("This author is still referenced by published or draft content.");
  await Author.findByIdAndDelete(id); revalidatePath("/admin/authors"); return { ok: true };
}
