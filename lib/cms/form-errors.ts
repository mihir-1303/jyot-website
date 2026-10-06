export const cmsFieldLabels: Record<string, string> = {
  title: "Title", slug: "URL Slug", excerpt: "Excerpt", content: "Content", description: "Description", coverMedia: "Cover Image", coverImage: "Cover Image", thumbnail: "Thumbnail", category: "Category", tags: "Tags", author: "Author", authors: "Authors", type: "Research Type", externalUrl: "Video URL", sourceType: "Source Type", name: "Name", bio: "Biography", photo: "Profile Image", scheduledLocal: "Scheduled Date & Time", archiveReason: "Archive Reason", configuration: "Homepage configuration",
};

export function cmsLabel(field: string) { return cmsFieldLabels[field] ?? field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()); }

export function normalizeCmsError(cause: unknown, fallback = "We couldn't save these changes right now. Please review the highlighted fields and try again.") {
  const message = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "";
  if (!message || /(validation failed|path [`'\"]?.+[`'\"]?\s+is required|mongoose|mongodb|mongo server|zoderror|invalid_type|too_small|invalid_string|cast to objectid|e11000|schema error|stack trace)/i.test(message)) return fallback;
  if (/slug/i.test(message) && /duplicate|already in use|already exists|e11000/i.test(message)) return "This URL slug is already in use. Please choose a different slug.";
  if (/duplicate|already in use|already exists|e11000/i.test(message)) return "This value is already in use. Please choose a different value.";
  if (/not found|could not be found|no longer exists/i.test(message)) return "One of the selected items could not be found. Please select it again.";
  if (/forbidden|unauthorized|permission/i.test(message)) return "You do not have permission to make this change.";
  if (/mongo|cast error|objectid|validationerror|zod|invalid content fields/i.test(message)) return "Some fields need attention. Please review the form and try again.";
  return message;
}

export function humanValidationMessage(path: PropertyKey[], issueMessage: string) {
  const field = String(path[path.length - 1] ?? "");
  if (field === "title") return "Title is required. Please enter a title.";
  if (field === "slug") return "URL slug can only contain lowercase letters, numbers, and hyphens.";
  if (field === "excerpt") return "Excerpt is required. Please provide a short summary.";
  if (field === "content") return "Content is required. Please add some content before saving.";
  if (field === "description") return "Description is required. Please enter a description.";
  if (field === "category") return "Category is required. Please select a category.";
  if (field === "author") return "Author is required. Please select an author.";
  if (field === "authors") return "At least one author is required. Please select an author.";
  if (field === "type") return "Research type is required. Please enter a research type.";
  return issueMessage.replace(/Expected string, received .+/i, "Please enter a value.").replace(/^Invalid input$/i, "Please review this field.");
}

function cmsFieldMessage(field: string, kind?: string) {
  if (kind === "research") {
    if (field === "title") return "Title is required. Please enter a title for this research.";
    if (field === "description") return "Description is required. Please enter a description for this research.";
    if (field === "content") return "Content is required. Please add the research content.";
    if (field === "category") return "Research topic is required. Please select a topic.";
    if (field === "coverMedia") return "Cover image is required to publish this research. Please select an image from the Media Library.";
  }
  return humanValidationMessage([field], "");
}

export function formatValidationIssues(issues: { path: PropertyKey[]; message: string }[], kind?: string) {
  return issues.map((issue) => cmsFieldMessage(String(issue.path[issue.path.length - 1] ?? ""), kind)).filter(Boolean).filter((message, index, values) => values.indexOf(message) === index).join(" ");
}

export type CmsFieldErrors = Record<string, string>;
export type CmsValidation = { fieldErrors: CmsFieldErrors; formError?: string };
export type CmsErrorDetails = { fieldErrors: CmsFieldErrors; formError: string };

function technicalFieldErrors(cause: unknown, kind?: string): CmsFieldErrors {
  const errors: CmsFieldErrors = {};
  const source = cause as { errors?: Record<string, { path?: string; message?: string }>; issues?: { path?: PropertyKey[]; message?: string }[] } | null;
  for (const field of Object.keys(source?.errors ?? {})) errors[field] = cmsFieldMessage(field, kind);
  for (const issue of source?.issues ?? []) {
    const field = String(issue.path?.[issue.path.length - 1] ?? "");
    if (field) errors[field] = cmsFieldMessage(field, kind);
  }
  const message = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : "";
  const requiredPattern = /(?:^|[\s,;])([A-Za-z][A-Za-z0-9_.]*)\s*:\s*(?:Path\s*[`'\"]?[^`'\"]+[`'\"]?\s+is required|(?:required|Required))/g;
  for (const match of message.matchAll(requiredPattern)) errors[match[1]] = cmsFieldMessage(match[1], kind);
  for (const field of ["title", "description", "content", "category", "coverMedia", "author", "authors", "tags", "type"]) { const mapped = cmsFieldMessage(field, kind); if (mapped && message.includes(mapped)) errors[field] = mapped; }
  return errors;
}

export function normalizeCmsErrorDetails(cause: unknown, kind?: string, fallback = "We couldn't save these changes right now. Please review the highlighted fields and try again."): CmsErrorDetails {
  const fieldErrors = technicalFieldErrors(cause, kind);
  if (Object.keys(fieldErrors).length) return { fieldErrors, formError: "Please fix the highlighted fields before continuing." };
  return { fieldErrors: {}, formError: normalizeCmsError(cause, fallback) };
}

const valueOf = (form: HTMLFormElement, name: string) => String(new FormData(form).get(name) ?? "").trim();
const hasContent = (value: string) => { if (!value) return false; try { const parsed = JSON.parse(value) as { content?: unknown[] }; return Array.isArray(parsed.content) ? parsed.content.some((node) => { const item = node as { type?: string; text?: string; content?: unknown[] }; return item.type === "image" || Boolean(item.text?.trim()) || Boolean(item.content?.length); }) : Boolean(value.trim()); } catch { return value.replace(/<[^>]*>/g, "").trim().length > 0; } };

export function validateCmsForm(form: HTMLFormElement, kind: "article" | "video" | "research" | "author" | "topic" | "category", publishing = false): CmsValidation {
  const errors: CmsFieldErrors = {};
  const requireValue = (field: string, message: string) => { if (!valueOf(form, field)) errors[field] = message; };
  if (kind === "author" || kind === "topic" || kind === "category") { requireValue("name", `${cmsLabel("name")} is required. Please enter a name.`); }
  if (kind === "article" || kind === "video" || kind === "research") {
    requireValue("title", "Title is required. Please enter a title.");
    const slug = valueOf(form, "slug"); if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.slug = "URL slug can only contain lowercase letters, numbers, and hyphens.";
  }
  if (kind === "article") { requireValue("excerpt", "Excerpt is required. Please provide a short summary."); requireValue("author", "Author is required. Please select an author."); requireValue("category", "Category is required. Please select a category."); if (publishing && !valueOf(form, "coverMedia")) errors.coverMedia = "Cover image is required to publish this article. Please select an image from the Media Library."; if (!hasContent(valueOf(form, "content"))) errors.content = "Content is required. Please add some content before saving."; }
  if (kind === "video") { requireValue("category", "Category is required. Please select a category."); if (!hasContent(valueOf(form, "description"))) errors.description = "Description is required. Please add a description before saving."; if (valueOf(form, "sourceType") === "external" && valueOf(form, "externalUrl") && !/^https?:\/\//i.test(valueOf(form, "externalUrl"))) errors.externalUrl = "Please enter a valid video URL starting with http:// or https://."; }
  if (kind === "research") { if (!valueOf(form, "title")) errors.title = "Title is required. Please enter a title for this research."; requireValue("description", "Description is required. Please enter a description for this research."); requireValue("category", "Research topic is required. Please select a topic."); requireValue("type", "Research type is required. Please enter a research type."); if (!hasContent(valueOf(form, "content"))) errors.content = "Content is required. Please add the research content."; }
  if (publishing && valueOf(form, "status") === "scheduled" && !valueOf(form, "scheduledLocal")) errors.scheduledLocal = "Scheduled date and time are required when publishing is scheduled.";
  return { fieldErrors: errors, formError: Object.keys(errors).length ? `Please fix the following before ${publishing ? "publishing" : "continuing"}.` : undefined };
}
