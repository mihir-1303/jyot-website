const absoluteHttpUrl = (value?: string) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

export function mediaDeliveryUrl(objectKey?: string) {
  const base = absoluteHttpUrl(process.env.MEDIA_DELIVERY_BASE_URL);
  const key = objectKey?.trim().replace(/^\/+/, "");
  if (!base || !key) return undefined;
  const encodedKey = key.split("/").map((part) => encodeURIComponent(part)).join("/");
  return new URL(encodedKey, `${base.replace(/\/+$/, "")}/`).toString();
}

export function mediaSourceFallback(sourceUrl?: string) {
  return absoluteHttpUrl(sourceUrl);
}

export function mediaUrlForAsset(objectKey?: string, sourceUrl?: string) {
  const source = mediaSourceFallback(sourceUrl);
  const normalizedKey = objectKey?.trim().replace(/^\/+/, "");
  if (normalizedKey?.startsWith("seed/") && source) return source;
  return mediaDeliveryUrl(objectKey) ?? source;
}
