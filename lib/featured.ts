export type FeaturedContentType = "article" | "research" | "video";
export type FeaturedReference = { type: FeaturedContentType; id: string };

export function featuredReferenceKey(reference: FeaturedReference) { return `${reference.type}:${reference.id}`; }

export function featuredReferencesFromSections(sections: unknown[]): FeaturedReference[] {
  const references: FeaturedReference[] = [];
  const seen = new Set<string>();
  const orderedSections = sections.map((section, index) => ({ section: section as { type?: string; order?: number; content?: { mode?: string; ids?: unknown[] } }, index })).sort((a, b) => (a.section.order ?? a.index) - (b.section.order ?? b.index));
  for (const { section } of orderedSections) {
    const type = section.type === "featured" ? "article" : section.type === "research" ? "research" : section.type === "videos" ? "video" : undefined;
    if (!type || section.content?.mode !== "manual") continue;
    for (const rawId of section.content.ids ?? []) {
      const value = String(rawId);
      const [typedType, typedId] = value.split(":");
      const reference: FeaturedReference = typedId && ["article", "research", "video"].includes(typedType) ? { type: typedType as FeaturedContentType, id: typedId } : { type, id: value };
      const key = featuredReferenceKey(reference);
      if (reference.id && !seen.has(key)) { seen.add(key); references.push(reference); }
    }
  }
  return references;
}
