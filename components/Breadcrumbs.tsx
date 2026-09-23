import Link from "next/link";
import { canonical } from "../lib/seo";
import { JsonLd } from "./JsonLd";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];
  const structuredItems = trail.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    ...(item.href ? { item: canonical(item.href) } : {}),
  }));

  return <>
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumbs-list">
        {trail.map((item, index) => <li className="breadcrumbs-item" key={`${item.label}-${index}`}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page" className="breadcrumbs-current" title={item.label}>{item.label}</span>}
        </li>)}
      </ol>
    </nav>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: structuredItems }} />
  </>;
}
