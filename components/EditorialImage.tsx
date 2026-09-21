import type { PublicMediaAsset } from "../lib/types/public";
import { EditorialThumbnail } from "./EditorialThumbnail";

type EditorialImageProps = { src: string | PublicMediaAsset; alt?: string; priority?: boolean };

export function EditorialImage({ src, alt, priority = false }: EditorialImageProps) {
  return <EditorialThumbnail src={src} alt={alt} priority={priority} />;
}
