import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }, ...(process.env.MEDIA_DELIVERY_BASE_URL ? [{ protocol: new URL(process.env.MEDIA_DELIVERY_BASE_URL).protocol.replace(":", "") as "http" | "https", hostname: new URL(process.env.MEDIA_DELIVERY_BASE_URL).hostname }] : [])] },
  async headers() { return [{ source: "/(.*)", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }, { key: "X-Frame-Options", value: "DENY" }] }]; },
};

export default nextConfig;
