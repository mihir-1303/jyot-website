import Link from "next/link";
import type { PublicCategory } from "../lib/types/public";

export function EditorialClose() {
  return <section className="publication-close" aria-labelledby="publication-close-title"><div className="page-shell publication-close-inner"><div><p className="eyebrow">Jyot</p><h2 id="publication-close-title" className="serif publication-close-title">Ideas for a More Inclusive Tomorrow.</h2></div><Link href="/articles" className="publication-close-action">Explore the latest <span className="arrow" aria-hidden="true">→</span></Link></div></section>;
}

export function Footer({ categories = [] }: { categories?: PublicCategory[] }) {
  const topics = [...new Map(categories.filter((category) => category.name && category.slug).map((category) => [category.slug, category])).values()].slice(0, 6);
  return <footer id="footer" className="site-footer">
    <div className="page-shell">
      <div className="site-footer-top">
        <div className="site-footer-brand"><Link href="/" className="site-footer-wordmark" aria-label="Jyot home">JYOT</Link><p className="site-footer-tagline">Ideas for a More Inclusive Tomorrow.</p></div>
        <div className="site-footer-nav">
          <div className="site-footer-column"><p className="site-footer-label">Explore</p><Link href="/articles">Articles</Link><Link href="/research">Research</Link><Link href="/videos">Videos</Link><Link href="/collections">Collections</Link></div>
          {topics.length > 0 && <div className="site-footer-column"><p className="site-footer-label">Topics</p>{topics.map((category) => <Link href={`/articles?category=${encodeURIComponent(category.slug)}`} key={category.slug}>{category.name}</Link>)}</div>}
          <div className="site-footer-column"><p className="site-footer-label">Connect</p><a href="mailto:hello@jyot.org">Contact</a></div>
        </div>
      </div>
      <div className="site-footer-bottom"><p>© {new Date().getFullYear()} Jyot. All rights reserved.</p><a href="#top" className="back-to-top" aria-label="Back to top">Back to top <span aria-hidden="true">↑</span></a></div>
    </div>
  </footer>;
}
