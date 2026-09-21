import Image from "next/image";
import type { PublicMediaAsset } from "../lib/types/public";

type EditorialThumbnailProps = { src: string | PublicMediaAsset; alt?: string; priority?: boolean };

export function EditorialThumbnail({ src, alt, priority = false }: EditorialThumbnailProps) {
  const asset = typeof src === "string" ? undefined : src;
  const imageUrl = typeof src === "string" ? src : src.url;
  return <div className="editorial-thumbnail"><Image src={imageUrl} alt={alt ?? asset?.altText ?? ""} width={1600} height={900} priority={priority} /></div>;
}
