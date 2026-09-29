import { ResearchForm } from "../../../../components/cms/ResearchForm";
import { saveResearch } from "../../../../lib/cms/actions";
import { requirePermission } from "../../../../lib/permissions";
import { getAdminTaxonomyOptions } from "../../../../lib/data/admin";
export default async function NewResearchPage() { await requirePermission("research.create"); const options = await getAdminTaxonomyOptions(); return <main><h1 className="serif mb-8 text-5xl">New research</h1><ResearchForm action={saveResearch} options={options} /></main>; }
