import { ContentForm } from "../../../../components/cms/ContentForm";
import { saveArticle } from "../../../../lib/cms/actions";
import { requirePermission } from "../../../../lib/permissions";
import { getAdminTaxonomyOptions } from "../../../../lib/data/admin";
export default async function NewArticlePage() { await requirePermission("articles.create"); const options = await getAdminTaxonomyOptions(); return <main><h1 className="serif mb-8 text-5xl">New article</h1><ContentForm kind="article" action={saveArticle} options={options} /></main>; }
