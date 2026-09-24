import { MediaLibrary } from "../../../components/cms/MediaLibrary";
import { getMediaAssets } from "../../../lib/data/media";

export const dynamic = "force-dynamic";
const serialize = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export default async function MediaPage() {
  const items = await getMediaAssets(undefined, undefined, true);
  return <MediaLibrary initialItems={serialize(items)} />;
}
