"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="admin-error-page"><p className="admin-kicker">CMS</p><h1 className="admin-page-title">We couldn&apos;t complete that request.</h1><p className="admin-page-description">Please review the form fields and try again. If the problem continues, refresh the page and retry.</p><button type="button" className="media-primary-button" onClick={() => reset()}>Try again</button></main>;
}
