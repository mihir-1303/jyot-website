import { ContentForm } from "../../../../components/cms/ContentForm";
import { getAdminContent } from "../../../../lib/data/admin";
import { saveResearch } from "../../../../lib/cms/actions";
import { getAdminTaxonomyOptions } from "../../../../lib/data/admin";
export default async function EditResearchPage({ params }: { params: Promise<{ id: string }> }) { const item = await getAdminContent("research", (await params).id); if (!item) return <p>Research not found.</p>; const options = await getAdminTaxonomyOptions(); return <main><h1 className="serif mb-8 text-5xl">Edit research</h1><ContentForm kind="research" action={saveResearch} value={item as unknown as Record<string, unknown>} options={options} /></main>; }
