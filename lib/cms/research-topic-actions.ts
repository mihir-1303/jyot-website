"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";
import { connectToDatabase } from "../db/mongodb";
import { Article, Category, Research, Video } from "../db/models";
import { requirePermission } from "../permissions";

function slugify(value: string) {
  const slug = value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180).replace(/-+$/g, "");
  if (!slug) throw new Error("A topic name is required.");
  return slug;
}

function formValues(formData: FormData) {
  return { id: String(formData.get("id") ?? "").trim(), name: String(formData.get("name") ?? "").trim(), slug: String(formData.get("slug") ?? "").trim(), description: String(formData.get("description") ?? "").trim(), displayOrder: Number(formData.get("displayOrder") ?? 0), active: formData.get("active") === "on" };
}

export async function saveResearchTopic(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const user = await requirePermission(id ? "categories.edit" : "categories.create");
  await connectToDatabase();
  const values = formValues(formData);
  const slug = values.slug || slugify(values.name);
  const filter = values.id && isValidObjectId(values.id) ? { _id: { $ne: values.id } } : {};
  if (await Category.exists({ slug, ...filter })) throw new Error("That topic slug is already in use.");
  const data = { name: values.name, slug, description: values.description || undefined, displayOrder: Number.isFinite(values.displayOrder) ? values.displayOrder : 0, active: values.active, updatedBy: user.id };
  if (values.id) {
    if (!isValidObjectId(values.id)) throw new Error("Invalid topic.");
    await Category.findByIdAndUpdate(values.id, { $set: data }, { runValidators: true }).exec();
  } else {
    await Category.create({ ...data, createdBy: user.id });
  }
  revalidateTag("public-categories", "max");
  revalidateTag("public-research", "max");
  revalidateTag("public-homepage", "max");
  revalidatePath("/"); revalidatePath("/research"); revalidatePath("/admin/research/topics");
}

export async function deleteResearchTopic(formData: FormData) {
  await requirePermission("categories.delete");
  const id = String(formData.get("id") ?? "");
  if (!isValidObjectId(id)) throw new Error("Invalid topic.");
  await connectToDatabase();
  const used = await Promise.all([Article.exists({ category: id }), Video.exists({ category: id }), Research.exists({ category: id })]);
  if (used.some(Boolean)) await Category.findByIdAndUpdate(id, { $set: { active: false } }).exec();
  else await Category.findByIdAndDelete(id).exec();
  revalidateTag("public-categories", "max"); revalidateTag("public-homepage", "max");
  revalidatePath("/"); revalidatePath("/research"); revalidatePath("/admin/research/topics");
}
