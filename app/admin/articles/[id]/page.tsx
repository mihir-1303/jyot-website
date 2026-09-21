import { redirect } from "next/navigation";
export default async function ArticleAdminRedirect({ params }: { params: Promise<{ id: string }> }) { redirect(`/admin/articles/${(await params).id}/edit`); }
