type SkeletonProps = { className?: string };

export function Skeleton({ className = "" }: SkeletonProps) {
  return <span aria-hidden="true" className={`skeleton ${className}`} />;
}

export function SkeletonLines({ count = 2, className = "" }: { count?: number; className?: string }) {
  return <div aria-hidden="true" className={`skeleton-lines ${className}`}>{Array.from({ length: count }, (_, index) => <Skeleton className="skeleton-line" key={index} />)}</div>;
}

export function SkeletonBreadcrumb() {
  return <div className="skeleton-breadcrumb" aria-hidden="true"><Skeleton className="skeleton-breadcrumb-item" /><Skeleton className="skeleton-breadcrumb-separator" /><Skeleton className="skeleton-breadcrumb-item skeleton-breadcrumb-current" /></div>;
}

function SkeletonCard({ kind }: { kind: "article" | "video" | "research" }) {
  return <article className={kind === "video" ? "video-card" : "publication-card"} aria-hidden="true">
    <Skeleton className="skeleton-card-media" />
    <div className={kind === "video" ? "video-card-content" : "publication-card-copy"}>
      <Skeleton className="skeleton-meta" />
      <Skeleton className="skeleton-card-title" />
      <Skeleton className="skeleton-card-title skeleton-card-title-short" />
      {kind !== "research" && <Skeleton className="skeleton-card-copy" />}
      <Skeleton className="skeleton-card-footer" />
    </div>
  </article>;
}

export function HomepageSkeleton() {
  return <main aria-busy="true" className="homepage-skeleton">
    <div className="skeleton-site-header" aria-hidden="true"><Skeleton className="skeleton-ticker" /><div className="skeleton-header-row"><Skeleton className="skeleton-wordmark" /><div className="skeleton-header-nav"><Skeleton className="skeleton-header-link" /><Skeleton className="skeleton-header-link" /><Skeleton className="skeleton-header-link" /></div><Skeleton className="skeleton-header-action" /></div></div>
    <section className="homepage-hero" aria-hidden="true"><div className="homepage-hero-inner"><div className="hero-stage"><div className="hero-skeleton-track"><Skeleton className="hero-skeleton-media" /><div className="hero-skeleton-panel"><Skeleton className="skeleton-meta" /><Skeleton className="hero-skeleton-date" /><Skeleton className="hero-skeleton-title" /><Skeleton className="hero-skeleton-title hero-skeleton-title-short" /><SkeletonLines count={2} className="hero-skeleton-description" /><Skeleton className="hero-skeleton-cta" /></div></div><div className="hero-pagination"><Skeleton className="hero-skeleton-dot" /><Skeleton className="hero-skeleton-dot" /><Skeleton className="hero-skeleton-dot" /></div></div></div></section>
    <section className="section skeleton-section" aria-hidden="true"><div className="page-shell"><Skeleton className="skeleton-section-heading" /><div className="skeleton-home-grid"><SkeletonCard kind="article" /><SkeletonCard kind="article" /><SkeletonCard kind="article" /></div></div></section>
    <section className="section skeleton-section" aria-hidden="true"><div className="page-shell"><Skeleton className="skeleton-section-heading skeleton-section-heading-wide" /><div className="skeleton-home-grid"><SkeletonCard kind="video" /><SkeletonCard kind="video" /><SkeletonCard kind="video" /></div></div></section>
  </main>;
}

export function ListingSkeleton({ kind }: { kind: "article" | "video" | "research" }) {
  const label = kind === "article" ? "Articles" : kind === "video" ? "Videos" : "Research";
  return <main aria-busy="true" className="listing-page page-shell section">
    <SkeletonBreadcrumb />
    <header className="listing-page-header"><Skeleton className="skeleton-eyebrow" /><Skeleton className="skeleton-page-title" /><Skeleton className="skeleton-intro" /></header>
    <nav aria-label={`${label} categories`} className="listing-topic-nav" aria-hidden="true"><Skeleton className="skeleton-topic" /><Skeleton className="skeleton-topic skeleton-topic-wide" /><Skeleton className="skeleton-topic" /><Skeleton className="skeleton-topic" /></nav>
    <section className="listing-lead-section" aria-hidden="true"><div className="listing-section-heading"><Skeleton className="skeleton-section-heading" /><Skeleton className="skeleton-section-subheading" /></div><div className="listing-feature"><Skeleton className="skeleton-feature-media" /><div className="listing-feature-copy"><Skeleton className="skeleton-meta" /><Skeleton className="skeleton-feature-title" /><Skeleton className="skeleton-feature-title skeleton-feature-title-short" /><SkeletonLines count={3} /><Skeleton className="skeleton-feature-footer" /></div></div></section>
    <section className="listing-latest-section" aria-hidden="true"><div className="listing-section-heading"><Skeleton className="skeleton-section-heading skeleton-section-heading-wide" /><Skeleton className="skeleton-section-subheading" /></div><div className="publication-grid">{[0, 1, 2].map((index) => <SkeletonCard kind={kind} key={index} />)}</div></section>
  </main>;
}

export function CollectionListingSkeleton() {
  return <main aria-busy="true" className="listing-page page-shell section"><SkeletonBreadcrumb /><header className="listing-page-header"><Skeleton className="skeleton-eyebrow" /><Skeleton className="skeleton-page-title" /><Skeleton className="skeleton-intro" /></header><div className="publication-grid collection-grid" aria-hidden="true">{[0, 1, 2].map((index) => <div className="publication-card" key={index}><Skeleton className="skeleton-card-media" /><div className="publication-card-copy"><Skeleton className="skeleton-meta" /><Skeleton className="skeleton-card-title" /><Skeleton className="skeleton-card-title skeleton-card-title-short" /><SkeletonLines count={2} /></div></div>)}</div></main>;
}

export function SearchSkeleton() {
  return <main aria-busy="true" className="page-shell section search-page"><Skeleton className="skeleton-eyebrow" /><Skeleton className="skeleton-search-title" /><Skeleton className="skeleton-intro" /><Skeleton className="skeleton-search-input" /><div className="skeleton-search-results" aria-hidden="true">{[0, 1, 2].map((index) => <div className="skeleton-search-result" key={index}><Skeleton className="skeleton-search-media" /><div><Skeleton className="skeleton-meta" /><Skeleton className="skeleton-search-result-title" /><SkeletonLines count={2} /></div></div>)}</div></main>;
}

export function DetailSkeleton({ kind }: { kind: "article" | "video" | "research" }) {
  const isArticle = kind === "article";
  return <main aria-busy="true" className={`page-shell section ${isArticle ? "article-page" : kind === "video" ? "max-w-4xl" : "max-w-5xl"}`}>
    <SkeletonBreadcrumb />
    <Skeleton className="skeleton-eyebrow" /><Skeleton className="skeleton-detail-title" /><Skeleton className="skeleton-detail-title skeleton-detail-title-short" /><Skeleton className="skeleton-detail-meta" />
    {kind === "video" ? <Skeleton className="skeleton-video-player" /> : <Skeleton className="skeleton-detail-media" />}
    <SkeletonLines count={isArticle ? 8 : 5} className="skeleton-detail-body" />
  </main>;
}

export function CollectionDetailSkeleton() {
  return <main aria-busy="true" className="collection-page page-shell section"><SkeletonBreadcrumb /><header className="collection-header"><Skeleton className="skeleton-eyebrow" /><Skeleton className="skeleton-collection-title" /><Skeleton className="skeleton-collection-title skeleton-collection-title-short" /><SkeletonLines count={2} className="skeleton-collection-description" /><Skeleton className="skeleton-collection-cover" /></header><section className="collection-stories"><Skeleton className="skeleton-section-heading skeleton-section-heading-wide" /><div className="skeleton-collection-list">{[0, 1, 2].map((index) => <div className="skeleton-collection-item" key={index}><Skeleton className="skeleton-collection-item-media" /><div><Skeleton className="skeleton-meta" /><Skeleton className="skeleton-card-title" /><SkeletonLines count={2} /></div></div>)}</div></section></main>;
}
