"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import type { HeaderLink } from "./Header";

function MenuIcon({ open }: { open: boolean }) {
  return <span className="relative block h-4 w-5" aria-hidden="true"><span className={`absolute left-0 top-1 block h-px w-5 bg-current transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`} /><span className={`absolute left-0 top-2.5 block h-px w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} /><span className={`absolute left-0 top-4 block h-px w-5 bg-current transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`} /></span>;
}

export default function HeaderInteractive({ links, actions, children }: { links: HeaderLink[]; actions: ReactNode; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;

    const updateScrollState = () => header.classList.toggle("site-header-scrolled", window.scrollY > 12);
    const updateActiveLinks = () => {
      header.querySelectorAll<HTMLElement>("[data-header-nav]").forEach((link) => {
        const href = link.dataset.navHref;
        const active = Boolean(href && href !== "#footer" && (pathname === href || pathname.startsWith(`${href}/`)));
        link.classList.toggle("nav-link-active", active);
      });
    };

    updateScrollState();
    updateActiveLinks();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return <><div className="site-header-row">{children}<div className="header-actions">{actions}<button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}><MenuIcon open={menuOpen} /></button></div></div><nav id="mobile-navigation" aria-label="Mobile navigation" aria-hidden={!menuOpen} className={`mobile-nav ${menuOpen ? "mobile-nav-open" : ""}`}>{links.map((link) => <Link href={link.href} data-header-nav data-nav-href={link.href} tabIndex={menuOpen ? 0 : -1} key={link.label} onClick={closeMenu}>{link.label}</Link>)}<Link href="/search" data-header-nav data-nav-href="/search" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}><svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" strokeLinecap="round" /></svg> Search</Link><a href="#footer" tabIndex={menuOpen ? 0 : -1} onClick={closeMenu}>Subscribe</a></nav></>;
}
