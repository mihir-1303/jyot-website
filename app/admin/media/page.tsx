import { MediaLibrary } from "../../../components/cms/MediaLibrary";
import { getMediaAssets } from "../../../lib/data/media";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const items = await getMediaAssets(undefined, undefined, true);
  return <MediaLibrary initialItems={items} />;
}
