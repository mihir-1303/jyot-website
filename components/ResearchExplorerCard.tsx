import Link from "next/link";
import type { PublicResearch } from "../lib/types/public";
import { Image16x9 } from "./Image16x9";
import styles from "./ResearchExplorer.module.css";

export function ResearchExplorerCard({ item }: { item: PublicResearch }) {
  return <article className={styles.card}><Link className="card-link group block" href={`/research/${item.slug}`}><Image16x9 src={item.coverImage} alt={item.title} sizes="(max-width: 767px) 91vw, (max-width: 1023px) 30vw, 360px" /><div className={styles.cardCopy}><p className="meta">{item.category.name} · {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p><h3 className={`${styles.cardTitle} serif transition-colors group-hover:text-[var(--orange)]`}>{item.title}</h3><p className={styles.cardAuthor}>— {item.authors.map((author) => author.name).join(" · ") || "Jyot Research"}</p></div></Link></article>;
}
