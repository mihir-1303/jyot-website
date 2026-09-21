import { ContentForm } from "../../../../components/cms/ContentForm";
import { saveVideo } from "../../../../lib/cms/actions";
import { requirePermission } from "../../../../lib/permissions";
import { getAdminTaxonomyOptions } from "../../../../lib/data/admin";
export default async function NewVideoPage() { await requirePermission("videos.create"); const options = await getAdminTaxonomyOptions(); return <main><p className="eyebrow">CMS</p><h1 className="serif mb-8 mt-2 text-5xl">New video</h1><ContentForm kind="video" action={saveVideo} options={options} /></main>; }
