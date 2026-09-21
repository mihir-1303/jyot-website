export function SectionHeader({ title }: { title: string }) {
  return <div className="mb-6 flex items-end gap-3 border-b pb-2.5 divider"><h2 className="serif text-2xl tracking-tight md:text-3xl">{title}</h2><span className="mb-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--orange)]" aria-hidden="true" /><span className="mb-1.5 hidden flex-1 border-b border-dotted border-[var(--line)] sm:block" /></div>;
}

export function SectionViewAll({ href, label, dark = false }: { href: string; label: string; dark?: boolean }) {
  return <div className={`section-view-all ${dark ? "section-view-all-dark" : ""}`}><a className="section-view-all-link" href={href}>{label} <span className="arrow" aria-hidden="true">→</span></a></div>;
}
