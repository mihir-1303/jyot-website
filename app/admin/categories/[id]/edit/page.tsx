import { notFound } from "next/navigation";
import { CategoryForm } from "../../../../../components/cms/CategoryForm";
import { getAdminCategories } from "../../../../../lib/data/admin";
import { requirePermission } from "../../../../../lib/permissions";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) { await requirePermission("categories.edit"); const { id } = await params; const category = (await getAdminCategories()).find((item) => String(item._id) === id); if (!category) notFound(); return <main><p className="eyebrow">CMS / Categories</p><h1 className="serif mt-2 text-5xl">Edit category</h1><CategoryForm category={category} /></main>; }
