import { notFound } from "next/navigation";
import { AuthorForm } from "../../../../../components/cms/AuthorForm";
import { saveAuthor } from "../../../../../lib/cms/author-actions";
import { getAdminAuthor } from "../../../../../lib/data/admin";
import { requirePermission } from "../../../../../lib/permissions";

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) { await requirePermission("authors.read"); const author = await getAdminAuthor((await params).id); if (!author) notFound(); return <main><p className="eyebrow">CMS / Authors</p><h1 className="serif mb-8 mt-2 text-5xl">Edit author</h1><AuthorForm action={saveAuthor} value={author as unknown as Record<string, unknown>} /></main>; }
