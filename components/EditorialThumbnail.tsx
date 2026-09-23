import Image from "next/image";
import type { PublicMediaAsset } from "../lib/types/public";

type EditorialThumbnailProps = { src: string | PublicMediaAsset; alt?: string; priority?: boolean; sizes?: string };

export function EditorialThumbnail({ src, alt, priority = false, sizes }: EditorialThumbnailProps) {
  const asset = typeof src === "string" ? undefined : src;
  const imageUrl = typeof src === "string" ? src : src.url;
  return <div className="editorial-thumbnail"><Image src={imageUrl} alt={alt ?? asset?.altText ?? ""} width={asset?.width ?? 1600} height={asset?.height ?? 900} priority={priority} sizes={sizes} /></div>;
}
