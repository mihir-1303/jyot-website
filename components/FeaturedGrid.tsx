import type { PublicArticle } from "../lib/types/public";
import { FeaturedStory } from "./FeaturedStory";

export function FeaturedGrid({ stories }: { stories: PublicArticle[] }) {
  return <div className="featured-layout">{stories.map((story) => <FeaturedStory key={story.id} story={story} />)}</div>;
}
