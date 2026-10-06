import { CategoryForm } from "../../../../components/cms/CategoryForm";
import { requirePermission } from "../../../../lib/permissions";

export default async function NewCategoryPage() { await requirePermission("categories.create"); return <main><p className="eyebrow">CMS / Categories</p><h1 className="serif mt-2 text-5xl">New category</h1><CategoryForm /></main>; }
