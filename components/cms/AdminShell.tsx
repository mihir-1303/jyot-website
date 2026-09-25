"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type IconName = "grid" | "file" | "play" | "book" | "layers" | "image" | "home" | "users" | "tag" | "menu" | "external";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    file: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
    play: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 8 5 4-5 4z"/></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h14v17H6a2 2 0 0 0-2 2z"/><path d="M4 5v15M8 7h8M8 11h8"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 2-2 7 6"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 6"/></>,
    tag: <><path d="M4 4h7l9 9-7 7-9-9z"/><circle cx="8" cy="8" r="1"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></>,
  };
  return <svg aria-hidden="true" className="admin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const groups = [
  { label: "Content", items: [["Dashboard", "/admin/dashboard", "grid"], ["Articles", "/admin/articles", "file"], ["Videos", "/admin/videos", "play"], ["Research", "/admin/research", "book"], ["Collections", "/admin/collections", "layers"]] },
  { label: "Media", items: [["Media library", "/admin/media", "image"]] },
  { label: "Site", items: [["Homepage", "/admin/homepage", "home"], ["Authors", "/admin/authors", "users"]] },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  const active = (href: string) => href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href);
  return <div className="admin-frame">
    <aside id="admin-navigation" className={`admin-sidebar ${open ? "admin-sidebar-open" : ""}`}>
      <div className="admin-brand"><Link href="/admin/dashboard" onClick={() => setOpen(false)}><span className="admin-brand-mark">J</span><span><strong>JYOT</strong><small>Editorial CMS</small></span></Link><button className="admin-mobile-close" type="button" onClick={() => setOpen(false)} aria-label="Close navigation">×</button></div>
      <nav className="admin-nav" aria-label="CMS navigation">{groups.map((group) => <div className="admin-nav-group" key={group.label}><p>{group.label}</p>{group.items.map(([label, href, icon]) => <Link className={active(href) ? "admin-nav-link admin-nav-link-active" : "admin-nav-link"} href={href} key={href + label} onClick={() => setOpen(false)}><Icon name={icon} />{label}</Link>)}</div>)}</nav>
      <div className="admin-sidebar-footer"><Link href="/" target="_blank"><Icon name="external" />View public site</Link><div className="admin-user-chip"><span>AD</span><div><strong>Administrator</strong><small>Content team</small></div></div></div>
    </aside>
    {open && <button className="admin-scrim" type="button" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <div className="admin-workspace"><header className="admin-topbar"><button className="admin-menu-button" type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="admin-navigation" aria-label="Open navigation"><Icon name="menu" /></button><div className="admin-breadcrumb"><span>Jyot CMS</span><b>/</b><strong>{pathname.split("/")[2] === "dashboard" || !pathname.split("/")[2] ? "Dashboard" : pathname.split("/")[2].replace(/-/g, " ")}</strong></div><div className="admin-topbar-right"><span className="admin-live-dot" /> Production <span className="admin-avatar">AD</span></div></header><main className="admin-main">{children}</main></div>
  </div>;
}
