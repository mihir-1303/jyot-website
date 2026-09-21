"use client";

import Link from "next/link";
import { useState } from "react";

export type EditorialTickerItem = { id: string; category: string; title: string; href: string };

const links = [
  { href: "/research", label: "Research" },
  { href: "/articles", label: "Articles" },
  { href: "/videos", label: "Videos" },
  { href: "#footer", label: "Events" },
  { href: "#footer", label: "About" },
];

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" strokeLinecap="round" /></svg>;
}

function MenuIcon({ open }: { open: boolean }) {
  return <span className="relative block h-4 w-5" aria-hidden="true"><span className={`absolute left-0 top-1 block h-px w-5 bg-current transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`} /><span className={`absolute left-0 top-2.5 block h-px w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} /><span className={`absolute left-0 top-4 block h-px w-5 bg-current transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`} /></span>;
}

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
  const [menuOpen, setMenuOpen] = useState(false);
  return <><EditorialTicker items={tickerItems} /><header className="site-header sticky top-0 z-30"><div className="page-shell"><div className="site-header-row"><Link href="/" className="brand" aria-label="Jyot home"><span className="brand-wordmark">JYOT</span><span className="brand-signature">IDEAS<br />PEOPLE<br />PERSPECTIVE</span></Link><nav aria-label="Main navigation" className="desktop-nav">{links.map((link) => <Link href={link.href} key={link.label}>{link.label}</Link>)}</nav><div className="header-actions"><Link href="/search" aria-label="Search Jyot" className="search-action"><SearchIcon /><span>Search</span></Link><a href="#footer" className="subscribe-button">Subscribe</a><button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}><MenuIcon open={menuOpen} /></button></div></div><nav id="mobile-navigation" aria-label="Mobile navigation" className={`mobile-nav ${menuOpen ? "mobile-nav-open" : ""}`}>{links.map((link) => <Link href={link.href} key={link.label} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}</nav></div></header></>;
}
