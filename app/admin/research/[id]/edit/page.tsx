import { notFound } from "next/navigation";
import { ContentForm } from "../../../../../components/cms/ContentForm";
import { saveResearch } from "../../../../../lib/cms/actions";
import { getAdminContent, getAdminTaxonomyOptions } from "../../../../../lib/data/admin";
import { requirePermission } from "../../../../../lib/permissions";

export default async function EditResearchPage({ params }: { params: Promise<{ id: string }> }) { await requirePermission("research.read"); const item = await getAdminContent("research", (await params).id); if (!item) notFound(); const options = await getAdminTaxonomyOptions(); return <main><p className="eyebrow">CMS / Research</p><h1 className="serif mb-8 mt-2 text-5xl">Edit research</h1><ContentForm kind="research" action={saveResearch} value={item as unknown as Record<string, unknown>} options={options} /></main>; }
