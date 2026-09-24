import { notFound } from "next/navigation";
import { AuthorForm } from "../../../../../components/cms/AuthorForm";
import { saveAuthor } from "../../../../../lib/cms/author-actions";
import { getAdminAuthor } from "../../../../../lib/data/admin";
import { requirePermission } from "../../../../../lib/permissions";
const serialize = (value: unknown) => JSON.parse(JSON.stringify(value));

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) { await requirePermission("authors.read"); const author = await getAdminAuthor((await params).id); if (!author) notFound(); return <main><p className="eyebrow">CMS / Authors</p><h1 className="serif mb-8 mt-2 text-5xl">Edit author</h1><AuthorForm action={saveAuthor} value={serialize(author) as Record<string, unknown>} /></main>; }
