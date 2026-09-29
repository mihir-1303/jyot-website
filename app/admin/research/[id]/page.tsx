import { ResearchForm } from "../../../../components/cms/ResearchForm";
import { getAdminContent, getAdminTaxonomyOptions } from "../../../../lib/data/admin";
import { saveResearch } from "../../../../lib/cms/actions";
export default async function EditResearchPage({ params }: { params: Promise<{ id: string }> }) { const item = await getAdminContent("research", (await params).id); if (!item) return <p>Research not found.</p>; const options = await getAdminTaxonomyOptions(); return <main><h1 className="serif mb-8 mt-2 text-5xl">Edit research</h1><ResearchForm action={saveResearch} value={item as unknown as Record<string, unknown>} options={options} /></main>; }
