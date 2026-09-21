import { AuthorForm } from "../../../../components/cms/AuthorForm";
import { saveAuthor } from "../../../../lib/cms/author-actions";
import { requirePermission } from "../../../../lib/permissions";

export default async function NewAuthorPage() { await requirePermission("authors.create"); return <main><p className="eyebrow">CMS / Authors</p><h1 className="serif mb-8 mt-2 text-5xl">New author</h1><AuthorForm action={saveAuthor} /></main>; }
