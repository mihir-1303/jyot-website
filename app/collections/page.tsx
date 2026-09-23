import { Breadcrumbs } from "../../components/Breadcrumbs";
import { CollectionCard } from "../../components/CollectionCard";
import { getPublishedCollections } from "../../lib/data/public";
import { editorialMetadata } from "../../lib/seo";

export const metadata = editorialMetadata({ title: "Collections", description: "Curated Jyot series connecting ideas, research and stories.", path: "/collections" });
export const dynamic = "force-dynamic";
export default async function CollectionsPage() { const collections = await getPublishedCollections(); return <main className="listing-page page-shell section"><Breadcrumbs items={[{ label: "Collections" }]} /><header className="listing-page-header"><p className="eyebrow">Jyot · Editorial</p><h1 className="serif listing-page-title">Collections</h1><p className="listing-intro">Curated series bringing related ideas, research and stories together.</p></header>{collections.length === 0 ? <p className="listing-empty">No published collections yet.</p> : <div className="publication-grid collection-grid">{collections.map((collection) => <CollectionCard collection={collection} key={collection.id} />)}</div>}</main>; }
