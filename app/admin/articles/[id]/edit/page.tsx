import { notFound } from "next/navigation";
import { ContentForm } from "../../../../../components/cms/ContentForm";
import { saveArticle } from "../../../../../lib/cms/actions";
import { getAdminContent, getAdminTaxonomyOptions } from "../../../../../lib/data/admin";
import { requirePermission } from "../../../../../lib/permissions";
const serialize = (value: unknown) => JSON.parse(JSON.stringify(value));

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("articles.read");
  const item = await getAdminContent("article", (await params).id);
  if (!item) notFound();
  const options = await getAdminTaxonomyOptions();
  return <main><p className="eyebrow">CMS / Articles</p><h1 className="serif mb-8 mt-2 text-5xl">Edit article</h1><ContentForm kind="article" action={saveArticle} value={serialize(item) as Record<string, unknown>} options={options} /></main>;
}
