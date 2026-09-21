import type { PublicMediaAsset as MediaAsset } from "../lib/types/public";
import { EditorialThumbnail } from "./EditorialThumbnail";
type Image16x9Props = { src: string | MediaAsset; alt?: string; priority?: boolean };
export function Image16x9({ src, alt, priority = false }: Image16x9Props) {
  return <EditorialThumbnail src={src} alt={alt} priority={priority} />;
}
