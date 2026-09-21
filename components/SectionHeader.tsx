export function SectionHeader({ title, href }: { title: string; href?: string }) {
  return <div className="mb-6 flex items-end gap-3 border-b pb-2.5 divider"><h2 className="serif text-2xl tracking-tight md:text-3xl">{title}</h2><span className="mb-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--orange)]" aria-hidden="true" /><span className="mb-1.5 hidden flex-1 border-b border-dotted border-[var(--line)] sm:block" />{href && <a className="eyebrow shrink-0 pb-0.5" href={href}>View all →</a>}</div>;
}
