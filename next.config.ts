import type { NextConfig } from "next";

function mediaDeliveryPattern() {
  const value = process.env.MEDIA_DELIVERY_BASE_URL;
  if (!value) return [];
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return [];
    return [{ protocol: url.protocol.replace(":", "") as "http" | "https", hostname: url.hostname }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }, ...mediaDeliveryPattern()] },
  async headers() { return [{ source: "/(.*)", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }, { key: "X-Frame-Options", value: "DENY" }] }]; },
};

export default nextConfig;
