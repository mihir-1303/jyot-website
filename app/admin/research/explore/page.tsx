import { ResearchExploreManager } from "../../../../components/cms/ResearchExploreManager";
import { saveResearchExploreDraft } from "../../../../lib/cms/research-explore-actions";
import { getResearchExploreManagerData } from "../../../../lib/data/admin";
import { requirePermission } from "../../../../lib/permissions";

export default async function ResearchExplorePage() {
  await requirePermission("homepage.view");
  const data = await getResearchExploreManagerData();
  const section = data.section as { content?: { ids?: unknown[] } } | undefined;
  return <main><p className="eyebrow">CMS / Research</p><h1 className="serif mt-2 text-5xl">Explore Research</h1><ResearchExploreManager revision={data.revision} initialIds={(section?.content?.ids ?? []).map(String)} candidates={data.research.map((item) => ({ id: String(item._id), title: String(item.title) }))} saveAction={saveResearchExploreDraft} /></main>;
}
