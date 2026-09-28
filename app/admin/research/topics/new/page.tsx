import { ResearchTopicForm } from "../../../../../components/cms/ResearchTopicForm";
import { requirePermission } from "../../../../../lib/permissions";

export default async function NewResearchTopicPage() { await requirePermission("categories.create"); return <main><p className="eyebrow">CMS / Research topics</p><h1 className="serif mt-2 text-5xl">New topic</h1><ResearchTopicForm /></main>; }
