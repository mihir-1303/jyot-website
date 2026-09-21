import Link from "next/link";
import type { PublicCategory } from "../lib/types/public";

export function ResearchExplorerTopics({ topics }: { topics: PublicCategory[] }) {
  return <nav aria-label="Research topics" className="research-topics"><p className="meta research-explorer-label">Topics</p><div className="research-topics-list"><Link className="research-topic research-topic-active" href="/research">All research</Link>{topics.map((topic) => <Link className="research-topic" href={`/research?category=${encodeURIComponent(topic.slug)}`} key={topic.id}>{topic.name}</Link>)}</div></nav>;
}
