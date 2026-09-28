import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
export default async function ArticleAdminRedirect({ params }: { params: Promise<{ id: string }> }) { const id = (await params).id; redirect(isValidObjectId(id) ? `/admin/articles/${id}/edit` : "/admin/articles"); }
