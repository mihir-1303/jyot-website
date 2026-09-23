import type { PublicMediaAsset as MediaAsset } from "../lib/types/public";
import { EditorialThumbnail } from "./EditorialThumbnail";
type Image16x9Props = { src: string | MediaAsset; alt?: string; priority?: boolean; sizes?: string };
export function Image16x9({ src, alt, priority = false, sizes }: Image16x9Props) {
  return <EditorialThumbnail src={src} alt={alt} priority={priority} sizes={sizes ?? "(max-width: 767px) 91vw, (max-width: 1023px) 44vw, 29vw"} />;
}
