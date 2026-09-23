import Link from "next/link";

type SectionViewAllProps = { href: string; label: string };

export function SectionViewAll({ href, label }: SectionViewAllProps) {
  return <div className="mt-6 flex justify-center"><Link href={href} className="eyebrow group inline-flex items-center gap-2 border-b border-[var(--orange)] pb-1.5"><span>{label}</span><span className="arrow text-lg">→</span></Link></div>;
}
