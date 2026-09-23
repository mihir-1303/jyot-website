import type { PublicMediaAsset } from "../lib/types/public";
import { EditorialThumbnail } from "./EditorialThumbnail";

type EditorialImageProps = { src: string | PublicMediaAsset; alt?: string; priority?: boolean; sizes?: string };

export function EditorialImage({ src, alt, priority = false, sizes }: EditorialImageProps) {
  const responsiveSizes = sizes ?? (priority ? "(max-width: 767px) 91vw, (max-width: 1023px) 52vw, 56vw" : "(max-width: 767px) 91vw, (max-width: 1023px) 44vw, 29vw");
  return <EditorialThumbnail src={src} alt={alt} priority={priority} sizes={responsiveSizes} />;
}
