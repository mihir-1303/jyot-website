import { VideoForm } from "../../../../components/cms/VideoForm";
import { saveVideo } from "../../../../lib/cms/actions";
import { requirePermission } from "../../../../lib/permissions";
import { getAdminTaxonomyOptions } from "../../../../lib/data/admin";
export default async function NewVideoPage() { await requirePermission("videos.create"); const options = await getAdminTaxonomyOptions(); return <main><h1 className="serif mb-8 text-5xl">New video</h1><VideoForm action={saveVideo} options={options} /></main>; }
