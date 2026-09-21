import { notFound } from "next/navigation";
import { ContentForm } from "../../../../../components/cms/ContentForm";
import { saveVideo } from "../../../../../lib/cms/actions";
import { getAdminContent, getAdminTaxonomyOptions } from "../../../../../lib/data/admin";
import { requirePermission } from "../../../../../lib/permissions";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("videos.read");
  const item = await getAdminContent("video", (await params).id);
  if (!item) notFound();
  const options = await getAdminTaxonomyOptions();
  return <main><p className="eyebrow">CMS / Videos</p><h1 className="serif mb-8 mt-2 text-5xl">Edit video</h1><ContentForm kind="video" action={saveVideo} value={item as unknown as Record<string, unknown>} options={options} /></main>;
}
