import { renderHomepageSections } from "../../../../components/HomepageSectionRenderer";
import { getHomepagePreviewData } from "../../../../lib/data/public";
import { requirePermission } from "../../../../lib/permissions";
export default async function HomepagePreviewPage() { await requirePermission("homepage.view"); const data = await getHomepagePreviewData(); return <><div className="border-b bg-[#17202b] px-8 py-4 text-white"><strong>Draft preview</strong><a className="ml-6 underline" href="/admin/homepage">Back to manager</a></div><main id="top">{renderHomepageSections(data)}</main></>; }
