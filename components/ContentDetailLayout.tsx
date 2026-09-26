import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { JsonLd } from "./JsonLd";

type BreadcrumbItem = { label: string; href?: string };

export function ContentDetailLayout({
  breadcrumbs,
  jsonLd,
  children,
}: {
  breadcrumbs: BreadcrumbItem[];
  jsonLd: Record<string, unknown>;
  children: ReactNode;
}) {
  return <main className="article-page page-shell section">
    <Breadcrumbs items={breadcrumbs} />
    <JsonLd data={jsonLd} />
    {children}
  </main>;
}
