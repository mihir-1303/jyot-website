import { notFound } from "next/navigation";
import { ResearchTopicForm } from "../../../../../../components/cms/ResearchTopicForm";
import { getAdminResearchTopics } from "../../../../../../lib/data/admin";
import { requirePermission } from "../../../../../../lib/permissions";

export default async function EditResearchTopicPage({ params }: { params: Promise<{ id: string }> }) { await requirePermission("categories.edit"); const { id } = await params; const topic = (await getAdminResearchTopics()).find((item) => String(item._id) === id); if (!topic) notFound(); return <main><p className="eyebrow">CMS / Research topics</p><h1 className="serif mt-2 text-5xl">Edit topic</h1><ResearchTopicForm topic={topic} /></main>; }
