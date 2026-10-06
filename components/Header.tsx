import Link from "next/link";
import HeaderInteractive from "./HeaderInteractive";

export type EditorialTickerItem = { id: string; category: string; title: string; href: string };
export type HeaderLink = { href: string; label: string };

const links: HeaderLink[] = [
  { href: "/research", label: "Research" },
  { href: "/articles", label: "Articles" },
  { href: "/videos", label: "Videos" },
  { href: "/categories", label: "Categories" },
  { href: "#footer", label: "Events" },
  { href: "/about", label: "About" },
];

function EditorialTicker({ items }: { items: EditorialTickerItem[] }) {
  if (!items.length) return null;
  const item = items[0];
  return <div className="editorial-ticker">
    <div className="page-shell flex min-w-0 items-center">
      <span className="ticker-marker" aria-hidden="true" /><span className="ticker-label">Latest</span>
      <Link key={item.id} href={item.href} className="ticker-link" aria-live="polite"><span className="ticker-category">{item.category}</span><span className="ticker-title">{item.title}</span></Link>
      <span className="ticker-count" aria-hidden="true">Latest published</span>
    </div>
  </div>;
}

export function Header({ tickerItems = [] }: { tickerItems?: EditorialTickerItem[] }) {
  return <><EditorialTicker items={tickerItems} /><header data-site-header className="site-header sticky top-0 z-30"><div className="page-shell"><HeaderInteractive links={links}><Link href="/" className="brand" aria-label="Jyot home"><span className="brand-wordmark">JYOT</span><span className="brand-signature">IDEAS<br />PEOPLE<br />PERSPECTIVE</span></Link><nav aria-label="Main navigation" className="desktop-nav">{links.map((link) => <Link href={link.href} data-header-nav data-nav-href={link.href} key={link.label}>{link.label}</Link>)}</nav></HeaderInteractive></div></header></>;
}
