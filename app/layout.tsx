import type { Metadata } from "next";
import "./globals.css";
import { SEO } from "../lib/seo";
export const metadata: Metadata = { title: "Jyot — Ideas, People, Perspective", description: SEO.siteDescription, metadataBase: new URL(SEO.siteUrl), alternates: { canonical: "/" }, openGraph: { title: "Jyot", description: SEO.siteDescription, url: SEO.siteUrl, siteName: SEO.siteName, type: "website", images: [{ url: SEO.defaultImage, width: 1600, height: 900 }] }, twitter: { card: "summary_large_image", title: "Jyot", description: SEO.siteDescription, images: [SEO.defaultImage] } };
export default function RootLayout({ children }: LayoutProps<"/">) { return <html lang="en" className="h-full antialiased"><body className="min-h-full">{children}</body></html>; }
