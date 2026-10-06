"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";
import { connectToDatabase } from "../db/mongodb";
import { Article, Category, Research, Video } from "../db/models";
import { requirePermission } from "../permissions";

const slugify = (value: string) => {
  const slug = value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180).replace(/-+$/g, "");
  if (!slug) throw new Error("A category name is required to generate a slug.");
  return slug;
};

const values = (formData: FormData) => ({
  id: String(formData.get("id") ?? "").trim(),
  name: String(formData.get("name") ?? "").trim(),
  slug: String(formData.get("slug") ?? "").trim(),
  description: String(formData.get("description") ?? "").trim(),
  displayOrder: Number(formData.get("displayOrder") ?? 0),
  active: formData.get("active") === "on",
});

function revalidateCategories() {
  revalidateTag("public-categories", "max");
  revalidateTag("public-articles", "max");
  revalidateTag("public-videos", "max");
  revalidateTag("public-research", "max");
  revalidateTag("public-homepage", "max");
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/videos");
  revalidatePath("/research");
  revalidatePath("/admin/categories");
}

export async function saveCategory(formData: FormData) {
  const data = values(formData);
  const user = await requirePermission(data.id ? "categories.edit" : "categories.create");
  if (!data.name) throw new Error("Category name is required. Please enter a name.");
  await connectToDatabase();
  const slug = data.slug || slugify(data.name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Category slug can only contain lowercase letters, numbers, and hyphens.");
  const filter = data.id && isValidObjectId(data.id) ? { _id: { $ne: data.id } } : {};
  if (await Category.exists({ slug, ...filter })) throw new Error("That category slug already exists. Choose a different slug.");
  if (await Category.exists({ name: { $regex: `^${data.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }, ...filter })) throw new Error("That category name already exists.");
  const update = { name: data.name, slug, description: data.description || undefined, displayOrder: Number.isFinite(data.displayOrder) ? data.displayOrder : 0, active: data.active, updatedBy: user.id };
  if (data.id) {
    if (!isValidObjectId(data.id)) throw new Error("That category could not be found.");
    await Category.findByIdAndUpdate(data.id, { $set: update }, { runValidators: true }).exec();
  } else await Category.create({ ...update, createdBy: user.id });
  revalidateCategories();
}

export async function createCategory(name: string) {
  const formData = new FormData();
  formData.set("name", name);
  formData.set("active", "on");
  await saveCategory(formData);
  await connectToDatabase();
  const category = await Category.findOne({ name: name.trim() }).select("_id name").sort({ createdAt: -1 }).lean() as unknown as { _id: unknown; name: string } | null;
  return { id: String(category?._id ?? ""), name: category?.name ?? name.trim() };
}

export async function deleteCategory(formData: FormData) {
  await requirePermission("categories.delete");
  const id = String(formData.get("id") ?? "").trim();
  if (!isValidObjectId(id)) throw new Error("That category could not be found.");
  await connectToDatabase();
  const [articles, videos, research] = await Promise.all([Article.exists({ category: id }), Video.exists({ category: id }), Research.exists({ category: id })]);
  if (articles || videos || research) {
    await Category.findByIdAndUpdate(id, { $set: { active: false } }).exec();
  } else await Category.findByIdAndDelete(id).exec();
  revalidateCategories();
}
