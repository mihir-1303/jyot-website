import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ContentForm } from "../../../../../components/cms/ContentForm";
import { saveArticle } from "../../../../../lib/cms/actions";
import { getAdminContent, getAdminTaxonomyOptions } from "../../../../../lib/data/admin";
import { requirePermission } from "../../../../../lib/permissions";
const serialize = (value: unknown) => JSON.parse(JSON.stringify(value));

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("articles.read");
  const id = (await params).id;
  if (!isValidObjectId(id)) redirect("/admin/articles");
  const item = await getAdminContent("article", id);
  if (!item) notFound();
  const options = await getAdminTaxonomyOptions();
  return <main><div className="admin-page-heading"><div><p className="eyebrow">CMS / Articles</p><h1 className="serif mt-2 text-5xl">Edit article</h1></div></div><ContentForm kind="article" action={saveArticle} value={serialize(item) as Record<string, unknown>} options={options} /></main>;
}
